import { ContractDeployment } from '../../types';
import { createNewTask } from '../../input';

export const verifyGaugeController = async function verifyGaugeController(
  contractDeployment: ContractDeployment,
  force = false
): Promise<void> {
  if (force || !contractDeployment.predeployed) {
    const previousTask = createNewTask('20220325-gauge-controller');
    await previousTask.verify('GaugeController', contractDeployment.address, contractDeployment.constructorArgs);
  }
};
