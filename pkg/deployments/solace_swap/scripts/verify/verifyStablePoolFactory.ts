import { ContractDeployment } from '../../types';
import { task } from '../../input';

export const verifyStablePoolFactory = async function verifyStablePoolFactory(
  contractDeployment: ContractDeployment,
  force = false
): Promise<void> {
  if (force || !contractDeployment.predeployed) {
    await task.verify('ComposableStablePoolFactory', contractDeployment.address, contractDeployment.constructorArgs);
  }
};
