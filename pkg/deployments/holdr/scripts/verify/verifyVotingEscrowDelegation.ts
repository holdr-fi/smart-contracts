import { ContractDeployment } from '../../types';
import { task } from '../../input';

export const verifyVotingEscrowDelegation = async function verifyVotingEscrowDelegation(
  contractDeployment: ContractDeployment,
  force = false
): Promise<void> {
  if (force || !contractDeployment.predeployed) {
    await task.verify('VotingEscrowDelegation', contractDeployment.address, contractDeployment.constructorArgs);
  }
};
