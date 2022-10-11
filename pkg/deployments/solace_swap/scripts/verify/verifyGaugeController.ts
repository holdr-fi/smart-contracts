import { ContractDeployment } from '../../types';
import { task } from '../../input';

export const verifyGaugeController = async function verifyGaugeController(
  contractDeployment: ContractDeployment,
  force = false
): Promise<void> {
  if (force || !contractDeployment.predeployed) {
    await task.verify('GaugeController', contractDeployment.address, contractDeployment.constructorArgs);
  }
};
