import { ContractDeployment } from '../../types';
import { task } from '../../input';

export const verifyBribeVault = async function verifyBribeVault(
  contractDeployment: ContractDeployment,
  force = false
): Promise<void> {
  if (force || !contractDeployment.predeployed) {
    await task.verify('BribeVault', contractDeployment.address, contractDeployment.constructorArgs);
  }
};
