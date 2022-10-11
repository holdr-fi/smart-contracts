import { ContractDeployment } from '../../types';
import { task } from '../../input';

export const verifyVault = async function verifyVault(
  contractDeployment: ContractDeployment,
  force = false
): Promise<void> {
  if (force || !contractDeployment.predeployed) {
    await task.verify('Vault', contractDeployment.address, contractDeployment.constructorArgs);
    const feeCollector = await contractDeployment.instance.getProtocolFeesCollector();
    const feeCollectorArgs = [contractDeployment.address]; // See ProtocolFeesCollector constructor
    await task.verify('ProtocolFeesCollector', feeCollector, feeCollectorArgs);
    await task.save({ ProtocolFeesCollector: feeCollector });
  }
};
