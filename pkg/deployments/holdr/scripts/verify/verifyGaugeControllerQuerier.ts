import { ContractDeployment } from '../../types';
import { task } from '../../input';

export const verifyGaugeControllerQuerier = async function verifyGaugeControllerQuerier(
  contractDeployment: ContractDeployment,
  force = false
): Promise<void> {
  if (force || !contractDeployment.predeployed) {
    await task.verify('GaugeControllerQuerier', contractDeployment.address, contractDeployment.constructorArgs);
  }
};
