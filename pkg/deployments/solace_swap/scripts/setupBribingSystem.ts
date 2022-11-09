import { setupBribeContracts } from './bribes';
import { ContractDeploymentCollection } from '../types';

export const setupBribingSystem = async function setupBribingSystem(
  contractDeploymentCollection: ContractDeploymentCollection
): Promise<void> {
  await setupBribeContracts(contractDeploymentCollection);
};
