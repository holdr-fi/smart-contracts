import { setupVotingEscrow, getVeSPT, voteForGauge, distributeRewards, setupGauge } from './vetokens';
import { ContractDeploymentCollection } from '../types';

export const setupVotingEscrowSystem = async function setupVotingEscrowSystem(
  contractDeploymentCollection: ContractDeploymentCollection
): Promise<void> {
  // await setupVotingEscrow(contractDeploymentCollection);
  // await getVeSPT(contractDeploymentCollection);
  // await voteForGauge(contractDeploymentCollection);
  // await distributeRewards(contractDeploymentCollection);
  await setupGauge(contractDeploymentCollection, '0xC2ED122265FFCa6CF1DbaE4AF6c37D940FcDFa0E');
};
