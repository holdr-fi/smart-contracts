import { BigNumber as BN, Contract } from 'ethers';
import { ContractDeploymentCollection } from '../../types';
import { ethers, logger, task } from '../../input';
import BALTokenHolderABI from '../../../tasks/2022xxxx-holdr/abi/BALTokenHolder.json';

export const distributeRewards = async function distributeRewards(
  contractDeploymentCollection: ContractDeploymentCollection
): Promise<void> {
  const [deployer] = await ethers.getSigners();
  const output = task.output({ ensure: false });
  const hldr = contractDeploymentCollection['HoldrGovernanceToken'].instance;
  const feeDistributor = contractDeploymentCollection['FeeDistributor'].instance;
  const tokenholder = new Contract(output['BALTokenHolder'], BALTokenHolderABI, deployer.provider);

  // 1. Call SingleRecipientGauge.checkpoint(), mint HLDR to Tokenholder
  logger.info('Calling SingleRecipientGauge.checkpoint()');
  const authorizerAdaptor = contractDeploymentCollection['AuthorizerAdaptor'].instance;
  await authorizerAdaptor.connect(deployer).performAction(output['SingleRecipientGauge'], '0xc2c4c5c1');

  logger.info('Successful SingleRecipientGauge.checkpoint(), now calling Tokenholder.withdraw()');

  // 2. Withdraw HLDR from Tokenholder
  const hldrMinted = await hldr.balanceOf(tokenholder.address);
  await tokenholder.connect(deployer).withdrawFunds(deployer.address, hldrMinted);

  logger.info(`Minted ${ethers.utils.formatUnits(hldrMinted, 18)} HLDR`);
  logger.info('Successful Tokenholder.withdraw(), now calling FeeDistrbutor.depositToken()');

  // 3. Deposit HLDR into FeeDistributor
  await feeDistributor.connect(deployer).depositToken(hldr.address, hldrMinted);

  logger.info('Successful FeeDistrbutor.depositToken()');
};
