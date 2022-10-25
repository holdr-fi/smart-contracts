import { BigNumberish, Contract, utils } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';
import BALTokenHolderABI from '../../tasks/2022xxxx-solace-swap/abi/BALTokenHolder.json';
import SingleRecipientGaugeABI from '../../tasks/2022xxxx-solace-swap/abi/SingleRecipientGauge.json';
import Task from '../../src/task';
import { GWEI } from '../constants/gasValues';
import { ZERO, ZERO_ADDRESS } from '../constants';

export const MAX_FEE = 80 * GWEI;
export const MAX_PRIORITY_FEE = 2 * GWEI;

export class VotingEscrowDeploymentHelper {
  tokenholderFactory: Contract;
  singleRecipientGaugeFactory: Contract;
  mainnetGaugeFactory: Contract;
  gaugeController: Contract;
  gaugeAdder: Contract;
  authorizer: Contract;
  authorizerAdaptor: Contract;
  signer: SignerWithAddress;
  task: Task;
  maxFeeInGwei: number;
  maxPriorityFeeInGwei: number;

  constructor(
    tokenholderFactory_: Contract,
    singleRecipientGaugeFactory_: Contract,
    mainnetGaugeFactory_: Contract,
    gaugeController_: Contract,
    gaugeAdder_: Contract,
    authorizer_: Contract,
    authorizerAdaptor: Contract,
    signer_: SignerWithAddress,
    task_: Task,
    maxFeeInGwei_?: number,
    maxPriorityFeeInGwei_?: number
  ) {
    this.tokenholderFactory = tokenholderFactory_;
    this.singleRecipientGaugeFactory = singleRecipientGaugeFactory_;
    this.mainnetGaugeFactory = mainnetGaugeFactory_;
    this.gaugeController = gaugeController_;
    this.gaugeAdder = gaugeAdder_;
    this.authorizer = authorizer_;
    this.authorizerAdaptor = authorizerAdaptor;
    this.signer = signer_;
    this.task = task_;
    if (maxFeeInGwei_ !== undefined) {
      this.maxFeeInGwei = maxFeeInGwei_;
    }
    if (maxPriorityFeeInGwei_ !== undefined) {
      this.maxPriorityFeeInGwei = maxPriorityFeeInGwei_;
    }
  }

  async performAction(targetContract: Contract, functionName: string, parameters: any[]): Promise<void> {
    const txData = targetContract.interface.encodeFunctionData(functionName, parameters);
    await this.authorizerAdaptor.connect(this.signer).performAction(targetContract.address, txData);
  }

  async grantRole(
    address: string,
    actionIdStorer: Contract,
    functionStorerInterface: utils.Interface,
    functionName: string
  ): Promise<void> {
    const selector = functionStorerInterface.getSighash(functionStorerInterface.getFunction(functionName));
    const actionId = await actionIdStorer.getActionId(selector);
    await this.authorizer.connect(this.signer).grantRole(actionId, address);
  }

  async revokeRole(
    address: string,
    actionIdStorer: Contract,
    functionStorerInterface: utils.Interface,
    functionName: string
  ): Promise<void> {
    const selector = functionStorerInterface.getSighash(functionStorerInterface.getFunction(functionName));
    const actionId = await actionIdStorer.getActionId(selector);
    await this.authorizer.connect(this.signer).revokeRole(actionId, address);
  }

  async hasRole(
    address: string,
    actionIdStorer: Contract,
    functionStorerInterface: utils.Interface,
    functionName: string
  ): Promise<boolean> {
    const selector = functionStorerInterface.getSighash(functionStorerInterface.getFunction(functionName));
    const actionId = await actionIdStorer.getActionId(selector);
    return await this.authorizer.hasRole(actionId, address);
  }

  async addGauge(gaugeAddress: string, gaugeTypeId: BigNumberish): Promise<void> {
    await this.performAction(this.gaugeController, 'add_gauge(address,int128)', [gaugeAddress, gaugeTypeId]);
  }

  // Add gauge type with 0 weight?
  async addGaugeType(name: string): Promise<void> {
    await this.performAction(this.gaugeController, 'add_type(string,uint256)', [name, 0]);
  }

  async setGaugeTypeWeight(gaugeTypeId: BigNumberish, weight: BigNumberish): Promise<void> {
    await this.performAction(this.gaugeController, 'change_type_weight', [gaugeTypeId, weight]);
  }

  async createSingleRecipientGauge(gaugeTypeId: BigNumberish, name: string, recipient: string): Promise<Contract> {
    let holder: string;
    let gauge: string;

    {
      const tx = await this.tokenholderFactory.connect(this.signer).create(name);
      const log = await tx.wait();
      // Someone didn't index the `balTokenHolder` field 🙄.
      holder = log?.events[0]?.args[0];
    }

    {
      const tx = await this.singleRecipientGaugeFactory.connect(this.signer).create(holder);
      const log = await tx.wait();
      gauge = log?.events[0]?.args[0];
      this.task.save({ ['SingleRecipientGauge']: gauge });
    }

    await this.addGauge(gauge, gaugeTypeId);

    const holderContract = new Contract(holder, BALTokenHolderABI, this.signer.provider);
    await this.grantRole(recipient, holderContract, holderContract.interface, 'withdrawFunds');

    const gaugeContract = new Contract(gauge, SingleRecipientGaugeABI, this.signer.provider);
    return gaugeContract;
  }

  async createMainnetGauge(poolAddress: string, poolName: string): Promise<void> {
    const currentGauge = await this.mainnetGaugeFactory.getPoolGauge(poolAddress);
    console.log('createMainnetGauge - currentGauge: ', currentGauge);

    if (currentGauge === ZERO_ADDRESS) {
      const tx = await this.mainnetGaugeFactory.connect(this.signer).create(poolAddress);
      const log = await tx.wait();
      const gauge = log?.events[0].args[0];
      await this.gaugeAdder.connect(this.signer).addEthereumGauge(gauge);
      this.task.save({ [poolName]: gauge });
    } else if (!(await this.gaugeController.gauge_exists(currentGauge))) {
      await this.gaugeAdder.connect(this.signer).addEthereumGauge(currentGauge);
      const output = this.task.output({ ensure: false });
      if (output[poolName] === undefined) {
        this.task.save({ [poolName]: currentGauge });
      }
    } else {
      const output = this.task.output({ ensure: false });
      if (output[poolName] === undefined) {
        this.task.save({ [poolName]: currentGauge });
      }
    }
  }
}
