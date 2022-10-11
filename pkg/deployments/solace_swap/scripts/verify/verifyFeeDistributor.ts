import { ContractDeployment } from '../../types';
import { task } from '../../input';

export const verifyFeeDistributor = async function verifyFeeDistributor(
  contractDeployment: ContractDeployment,
  force = false
): Promise<void> {
  if (force || !contractDeployment.predeployed) {
    await task.verify('FeeDistributor', contractDeployment.address, contractDeployment.constructorArgs);
  }
};
