import { ContractDeployment } from '../../types';
import { task } from '../../input';

export const verifyTokenAdmin = async function verifyTokenAdmin(
  contractDeployment: ContractDeployment,
  force = false
): Promise<void> {
  if (force || !contractDeployment.predeployed) {
    await task.verify('BalancerTokenAdmin', contractDeployment.address, contractDeployment.constructorArgs);
  }
};
