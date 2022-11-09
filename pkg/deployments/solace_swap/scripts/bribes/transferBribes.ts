import { ContractDeploymentCollection } from '../../types';
import axios from 'axios';
import { ethers, logger } from '../../input';

export const transferBribes = async function transferBribes(
  contractDeploymentCollection: ContractDeploymentCollection
): Promise<void> {
  const [deployer] = await ethers.getSigners();
  const API_URL = `${process.env.BRIBE_API_URL}transferbribes`;
  const resp = await axios.get(API_URL);
  const transferBribesParams: string[] = resp?.data;
  const bribeVault = contractDeploymentCollection['BribeVault'].instance;

  if (transferBribesParams.length > 0) {
    logger.info('Calling BribeVault.transferBribes()');
    await bribeVault.connect(deployer).transferBribes(transferBribesParams);
  }
};
