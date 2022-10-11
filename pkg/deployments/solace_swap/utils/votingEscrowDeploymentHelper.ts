import { BigNumberish, Contract } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';
import BALTokenHolderABI from '../../tasks/2022xxxx-solace-swap/abi/BALTokenHolder.json';
import SingleRecipientGaugeABI from '../../tasks/2022xxxx-solace-swap/abi/SingleRecipientGauge.json';
import Task from '../../src/task';

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

  constructor(
    tokenholderFactory_: Contract,
    singleRecipientGaugeFactory_: Contract,
    mainnetGaugeFactory_: Contract,
    gaugeController_: Contract,
    gaugeAdder_: Contract,
    authorizer_: Contract,
    authorizerAdaptor: Contract,
    signer_: SignerWithAddress,
    task_: Task
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
  }

  async performAction(targetContract: Contract, functionName: string, parameters: any[]): Promise<void> {
    const txData = targetContract.encodeFunctionData(functionName, parameters);
    await this.authorizerAdaptor.connect(this.signer).performAction(targetContract.address, txData);
  }

  async grantRole(
    address: string,
    actionIdStorer: Contract,
    functionStorer: Contract,
    functionName: string
  ): Promise<void> {
    const selector = functionStorer.getSighash(functionStorer.getFunction(functionName));
    const actionId = await actionIdStorer.getActionId(selector);
    await this.authorizer.connect(this.signer).grantRole(actionId, address);
  }

  async revokeRole(
    address: string,
    actionIdStorer: Contract,
    functionStorer: Contract,
    functionName: string
  ): Promise<void> {
    const selector = functionStorer.getSighash(functionStorer.getFunction(functionName));
    const actionId = await actionIdStorer.getActionId(selector);
    await this.authorizer.connect(this.signer).revokeRole(actionId, address);
  }

  async addGauge(gaugeAddress: string, gaugeType: string): Promise<void> {
    await this.performAction(this.gaugeController, 'add_gauge', [gaugeAddress, gaugeType]);
  }

  // Add gauge type with 0 weight?
  async addGaugeType(name: string): Promise<void> {
    await this.performAction(this.gaugeController, 'add_type', [name, 0]);
  }

  async setGaugeTypeWeight(gaugeTypeId: BigNumberish, weight: BigNumberish): Promise<void> {
    await this.performAction(this.gaugeController, 'change_type_weight', [gaugeTypeId, weight]);
  }

  async createSingleRecipientGauge(gaugeType: string, name: string, recipient: string): Promise<Contract> {
    let holder: string;
    let gauge: string;

    {
      const tx = await this.tokenholderFactory.connect(this.signer).create(name);
      const log = await tx.wait();
      holder = log?.events[0]?.holder;
    }

    {
      const tx = await this.singleRecipientGaugeFactory.connect(this.signer).create(holder);
      const log = await tx.wait();
      gauge = log?.events[0]?.gauge;
      this.task.save({ ['singleRecipientGauge']: gauge });
    }

    await this.addGauge(gauge, gaugeType);

    const holderContract = new Contract(holder, BALTokenHolderABI, this.signer.provider);
    await this.grantRole(recipient, holderContract, holderContract, 'withdrawFunds');

    const gaugeContract = new Contract(gauge, SingleRecipientGaugeABI, this.signer.provider);
    return gaugeContract;
  }

  async createMainnetGauge(poolAddress: string): Promise<void> {
    const tx = await this.mainnetGaugeFactory.connect(this.signer).create(poolAddress);
    const log = await tx.wait();
    const gauge = log?.events[0].gauge;
    await this.gaugeAdder.connect(this.signer).addEthereumGauge(gauge);
    this.task.save({ ['mainnetGauge']: gauge });
  }
}
