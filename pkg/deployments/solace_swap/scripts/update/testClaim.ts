import { ContractDeploymentCollection } from '../../types';
import axios from 'axios';
import { ethers, logger } from '../../input';
import { constants } from 'ethers';

export const testClaim = async function testClaim(
  contractDeploymentCollection: ContractDeploymentCollection
): Promise<void> {
  const [deployer] = await ethers.getSigners();
  const API_URL = `${process.env.BRIBE_API_URL}claims/?address=${deployer.address}`;
  const resp = await axios.get(API_URL);
  const claimParams: { identifier: string; account: string; amount: string; merkleProof: string[] }[] = resp?.data.map(
    (claim) => claim?.claimParams
  );
  const rewardDistributor = contractDeploymentCollection['RewardDistributor'].instance;

  console.log(claimParams);

  if (claimParams.length > 0) {
    logger.info('Calling RewardDistributor.claim()');
    await rewardDistributor.connect(deployer).claim(claimParams);
  }
};
