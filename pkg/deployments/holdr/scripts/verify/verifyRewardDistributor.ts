import { ContractDeployment } from '../../types';
import { task } from '../../input';

export const verifyRewardDistributor = async function verifyRewardDistributor(
  contractDeployment: ContractDeployment,
  force = false
): Promise<void> {
  if (force || !contractDeployment.predeployed) {
    await task.verify('RewardDistributor', contractDeployment.address, contractDeployment.constructorArgs);
  }
};
