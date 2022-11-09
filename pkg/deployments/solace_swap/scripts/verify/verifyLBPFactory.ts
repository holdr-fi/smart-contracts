import { ContractDeployment } from '../../types';
import { task } from '../../input';

export const verifyLBPFactory = async function verifyLBPFactory(
  contractDeployment: ContractDeployment,
  force = false
): Promise<void> {
  if (force || !contractDeployment.predeployed) {
    await task.verify(
      'NoProtocolFeeLiquidityBootstrappingPoolFactory',
      contractDeployment.address,
      contractDeployment.constructorArgs
    );
  }
};
