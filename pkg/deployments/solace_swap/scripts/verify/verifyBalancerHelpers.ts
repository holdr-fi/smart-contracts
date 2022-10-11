import { ContractDeployment } from '../../types';
import { task } from '../../input';

export const verifyBalancerHelpers = async function verifyBalancerHelpers(
  contractDeployment: ContractDeployment,
  force = false
): Promise<void> {
  if (force || !contractDeployment.predeployed) {
    await task.verify('BalancerHelpers', contractDeployment.address, contractDeployment.constructorArgs);
  }
};
