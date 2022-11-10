import { launchLBP } from './lbp';
import { ContractDeploymentCollection } from '../types';

export const setupLBP = async function setupLBP(
  contractDeploymentCollection: ContractDeploymentCollection
): Promise<void> {
  await launchLBP(contractDeploymentCollection);
};
