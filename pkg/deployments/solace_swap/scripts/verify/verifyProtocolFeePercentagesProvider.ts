import { ContractDeployment } from '../../types';
import { task } from '../../input';

export const verifyProtocolFeePercentagesProvider = async function verifyProtocolFeePercentagesProvider(
  contractDeployment: ContractDeployment,
  force = false
): Promise<void> {
  if (force || !contractDeployment.predeployed) {
    await task.verify('ProtocolFeePercentagesProvider', contractDeployment.address, contractDeployment.constructorArgs);
  }
};
