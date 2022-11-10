import { ContractDeployment } from '../../types';
import { task } from '../../input';

export const verifyTokenholderFactory = async function verifyTokenholderFactory(
  contractDeployment: ContractDeployment,
  force = false
): Promise<void> {
  if (force || !contractDeployment.predeployed) {
    await task.verify('BALTokenHolderFactory', contractDeployment.address, contractDeployment.constructorArgs);
  }
};
