import { ContractDeployment } from '../../types';
import { task } from '../../input';

export const verifyBalancerQueries = async function verifyBalancerQueries(
  contractDeployment: ContractDeployment,
  force = false
): Promise<void> {
  if (force || !contractDeployment.predeployed) {
    await task.verify('BalancerQueries', contractDeployment.address, contractDeployment.constructorArgs);
  }
};
