import { ContractDeployment } from '../../types';
import { task } from '../../input';

export const verifyToken = async function verifyToken(
  contractDeployment: ContractDeployment,
  force = false
): Promise<void> {
  if (force || !contractDeployment.predeployed) {
    await task.verify('HoldrGovernanceToken', contractDeployment.address, contractDeployment.constructorArgs);
  }
};
