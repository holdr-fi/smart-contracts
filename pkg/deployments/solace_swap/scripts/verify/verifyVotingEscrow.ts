import { ContractDeployment } from '../../types';
import { task } from '../../input';

export const verifyVotingEscrow = async function verifyVotingEscrow(
  contractDeployment: ContractDeployment,
  force = false
): Promise<void> {
  if (force || !contractDeployment.predeployed) {
    await task.verify('VotingEscrow', contractDeployment.address, contractDeployment.constructorArgs);
  }
};
