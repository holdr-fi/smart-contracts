import { transferBribes, updateRewardsMetadata } from './update';
import { ContractDeploymentCollection } from '../types';

export const updateBribes = async function updateBribes(
  contractDeploymentCollection: ContractDeploymentCollection
): Promise<void> {
  await transferBribes(contractDeploymentCollection);
  await updateRewardsMetadata(contractDeploymentCollection);
};
