import { setupVotingEscrow } from './setup';
import { ContractDeploymentCollection } from '../types';

export const setupVotingEscrowSystem = async function setupVotingEscrowSystem(
  contractDeploymentCollection: ContractDeploymentCollection
): Promise<void> {
  await setupVotingEscrow(contractDeploymentCollection);
};
