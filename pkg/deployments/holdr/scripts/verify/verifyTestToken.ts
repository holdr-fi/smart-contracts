import { ContractDeployment } from '../../types';
import { task } from '../../input';

export const verifyTestToken = async function verifyTestToken(
  contractDeployment: ContractDeployment,
  force = false
): Promise<void> {
  if (force || !contractDeployment.predeployed) {
    await task.verify('TestBalancerToken', contractDeployment.address, contractDeployment.constructorArgs);
  }
};
