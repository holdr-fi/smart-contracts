import { ContractDeployment } from '../../types';
import { task } from '../../input';

export const verifyAuthorizerAdaptor = async function verifyAuthorizerAdaptor(
  contractDeployment: ContractDeployment,
  force = false
): Promise<void> {
  if (force || !contractDeployment.predeployed) {
    await task.verify('AuthorizerAdaptor', contractDeployment.address, contractDeployment.constructorArgs);
  }
};
