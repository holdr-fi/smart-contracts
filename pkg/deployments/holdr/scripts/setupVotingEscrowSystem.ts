import { setupVotingEscrow, getVeSPT, voteForGauge } from './vetokens';
import { ContractDeploymentCollection } from '../types';

export const setupVotingEscrowSystem = async function setupVotingEscrowSystem(
  contractDeploymentCollection: ContractDeploymentCollection
): Promise<void> {
  await setupVotingEscrow(contractDeploymentCollection);
  await getVeSPT(contractDeploymentCollection);
  await voteForGauge(contractDeploymentCollection);
};
