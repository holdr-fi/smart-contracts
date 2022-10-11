import { ContractDeployment } from '../../types';
import { task } from '../../input';

export const verifyTokenMinter = async function verifyTokenMinter(
  contractDeployment: ContractDeployment,
  force = false
): Promise<void> {
  if (force || !contractDeployment.predeployed) {
    await task.verify('BalancerMinter', contractDeployment.address, contractDeployment.constructorArgs);
  }
};
