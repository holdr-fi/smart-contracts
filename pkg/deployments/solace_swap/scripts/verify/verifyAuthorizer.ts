import { ContractDeployment } from '../../types';
import { task } from '../../input';

export const verifyAuthorizer = async function verifyAuthorizer(
  contractDeployment: ContractDeployment,
  force = false
): Promise<void> {
  if (force || !contractDeployment.predeployed) {
    await task.verify('Authorizer', contractDeployment.address, contractDeployment.constructorArgs);
  }
};
