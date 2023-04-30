import { setupVotingEscrow, getVeSPT, voteForGauge, distributeRewards, setupGauge, killGauge } from './vetokens';
import { ContractDeploymentCollection } from '../types';

export const setupVotingEscrowSystem = async function setupVotingEscrowSystem(
  contractDeploymentCollection: ContractDeploymentCollection
): Promise<void> {
  // await setupVotingEscrow(contractDeploymentCollection);
  // await getVeSPT(contractDeploymentCollection);
  // await voteForGauge(contractDeploymentCollection);
  // await distributeRewards(contractDeploymentCollection);
  // await setupGauge(contractDeploymentCollection, '0xfF22d6E501BeA80a8b769de0347Cf421485FfEDD');
  await killGauge(contractDeploymentCollection, '0xbC4B15225b06429ADCC990788b01C17aDbb1b315');
};
