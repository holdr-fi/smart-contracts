import { setupBribeContracts } from './setup';
import { ContractDeploymentCollection } from '../types';

export const setupBribingSystem = async function setupBribingSystem(
  contractDeploymentCollection: ContractDeploymentCollection
): Promise<void> {
  await setupBribeContracts(contractDeploymentCollection);
};
