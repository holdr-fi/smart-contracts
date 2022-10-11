import { ContractDeployment } from '../../types';
import { task } from '../../input';

export const verifyGaugeAdder = async function verifyGaugeAdder(
  contractDeployment: ContractDeployment,
  force = false
): Promise<void> {
  if (force || !contractDeployment.predeployed) {
    await task.verify('GaugeAdder', contractDeployment.address, contractDeployment.constructorArgs);
  }
};
