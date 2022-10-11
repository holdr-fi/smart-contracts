import { ContractDeployment } from '../../types';
import { task } from '../../input';

export const verifyBatchRelayer = async function verifyBatchRelayer(
  contractDeployment: ContractDeployment,
  vaultAddress: string,
  force = false
): Promise<void> {
  if (force || !contractDeployment.predeployed) {
    await task.verify('BatchRelayerLibrary', contractDeployment.address, contractDeployment.constructorArgs);
    const relayer: string = await contractDeployment.instance.getEntrypoint();
    const relayerArgs = [vaultAddress, contractDeployment.address]; // See BalancerRelayer's constructor
    await task.verify('BalancerRelayer', relayer, relayerArgs);
    await task.save({ BalancerRelayer: relayer });
  }
};
