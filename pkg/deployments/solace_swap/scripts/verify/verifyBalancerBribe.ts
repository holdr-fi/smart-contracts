import { ContractDeployment } from '../../types';
import { task } from '../../input';

export const verifyBalancerBribe = async function verifyBalancerBribe(
  contractDeployment: ContractDeployment,
  force = false
): Promise<void> {
  if (force || !contractDeployment.predeployed) {
    await task.verify('BalancerBribe', contractDeployment.address, contractDeployment.constructorArgs);
  }
};
