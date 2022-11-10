import { ContractDeployment } from '../../types';
import { task } from '../../input';

export const verifyVotingEscrowDelegationProxy = async function verifyVotingEscrowDelegationProxy(
  contractDeployment: ContractDeployment,
  force = false
): Promise<void> {
  if (force || !contractDeployment.predeployed) {
    await task.verify('VotingEscrowDelegationProxy', contractDeployment.address, contractDeployment.constructorArgs);
  }
};
