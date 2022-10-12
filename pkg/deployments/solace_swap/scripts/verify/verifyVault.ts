import { ContractDeployment } from '../../types';
import { task, createNewTask } from '../../input';

export const verifyVault = async function verifyVault(
  contractDeployment: ContractDeployment,
  force = false
): Promise<void> {
  if (force || !contractDeployment.predeployed) {
    await task.verify('Vault', contractDeployment.address, contractDeployment.constructorArgs);
    const feeCollector = await contractDeployment.instance.getProtocolFeesCollector();
    const feeCollectorArgs = [contractDeployment.address]; // See ProtocolFeesCollector constructor
    const previousTask = createNewTask('20210418-vault');
    await previousTask.verify('ProtocolFeesCollector', feeCollector, feeCollectorArgs);
    await task.save({ ProtocolFeesCollector: feeCollector });
  }
};
