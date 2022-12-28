// THIS IS FOR TESTNET ONLY

// Deposit 100K SPT tokens into VotingEscrow contract, obtain veSPT
import { JoinPoolRequest } from '@balancer-labs/balancer-js';
import { WEEK } from '@balancer-labs/v2-helpers/src/time';
import { AssetHelpers } from '../../utils';
import { BigNumber as BN, Contract } from 'ethers';
import { ZERO, ONE_ETHER, WETH_ADDRESS } from '../../constants';
import { ContractDeploymentCollection } from '../../types';
import { ethers, logger, task } from '../../input';
const { defaultAbiCoder } = ethers.utils;
const { MaxUint256 } = ethers.constants;

export const distributeRewards = async function distributeRewards(
  contractDeploymentCollection: ContractDeploymentCollection
): Promise<void> {
  const [deployer] = await ethers.getSigners();
  const hldr = contractDeploymentCollection['HoldrGovernanceToken'].instance;
  const tokenholder = contractDeploymentCollection['BALTokenHolder'].instance;
  const feeDistributor = contractDeploymentCollection['FeeDistributor'].instance;

  // 1. Call SingleRecipientGauge.checkpoint(), mint HLDR to Tokenholder
  const authorizerAdaptor = contractDeploymentCollection['AuthorizerAdaptor'].instance;
  await authorizerAdaptor
    .connect(deployer)
    .performAction(contractDeploymentCollection['SingleRecipientGauge'].address, '0xc2c4c5c1');

  // 2. Withdraw HLDR from Tokenholder
  const hldrMinted = await hldr.balanceOf(tokenholder.address);
  await tokenholder.connect(deployer).withdrawFunds(deployer.address, hldrMinted);

  // 3. Deposit HLDR into FeeDistributor
  await feeDistributor.connect(deployer).depositToken(hldr.address, hldrMinted);
};
