import { ContractDeployment } from '../../types';
import { createNewTask } from '../../input';

export const verifyVotingEscrow = async function verifyVotingEscrow(
  contractDeployment: ContractDeployment,
  force = false
): Promise<void> {
  if (force || !contractDeployment.predeployed) {
    const previousTask = createNewTask('20220325-gauge-controller');
    await previousTask.verify('VotingEscrow', contractDeployment.address, contractDeployment.constructorArgs);
  }
};
