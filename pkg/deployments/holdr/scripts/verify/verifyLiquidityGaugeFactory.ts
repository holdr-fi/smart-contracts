import { ContractDeployment } from '../../types';
import { task } from '../../input';

export const verifyLiquidityGaugeFactory = async function verifyLiquidityGaugeFactory(
  contractDeployment: ContractDeployment,
  force = false
): Promise<void> {
  if (force || !contractDeployment.predeployed) {
    await task.verify('LiquidityGaugeFactory', contractDeployment.address, contractDeployment.constructorArgs);
  }
};
