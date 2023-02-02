import { setupVotingEscrow, getVeSPT, voteForGauge, distributeRewards, setupGauge } from './vetokens';
import { ContractDeploymentCollection } from '../types';

export const setupVotingEscrowSystem = async function setupVotingEscrowSystem(
  contractDeploymentCollection: ContractDeploymentCollection
): Promise<void> {
  // await setupVotingEscrow(contractDeploymentCollection);
  // await getVeSPT(contractDeploymentCollection);
  // await voteForGauge(contractDeploymentCollection);
  // await distributeRewards(contractDeploymentCollection);
  await setupGauge(contractDeploymentCollection, '0x5FdFDF63E1D3c4c466578602Ea127DeCF024f394');
};
