import { ContractDeployment } from '../../types';
import { task } from '../../input';

export const verifyMulticall = async function verifyMulticall(
  contractDeployment: ContractDeployment,
  force = false
): Promise<void> {
  if (force || !contractDeployment.predeployed) {
    await task.verify('Multicall2', contractDeployment.address, contractDeployment.constructorArgs);
  }
};
