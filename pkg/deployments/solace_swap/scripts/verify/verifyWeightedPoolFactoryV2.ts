import { ContractDeployment } from '../../types';
import { task } from '../../input';

export const verifyWeightedPoolFactoryV2 = async function verifyWeightedPoolFactoryV2(
  contractDeployment: ContractDeployment,
  force = false
): Promise<void> {
  if (force || !contractDeployment.predeployed) {
    await task.verify('WeightedPoolFactory', contractDeployment.address, contractDeployment.constructorArgs);
  }
};
