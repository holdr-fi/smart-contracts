import { ContractDeployment } from '../../types';
import { task, createNewTask } from '../../input';

export const verifyBatchRelayer = async function verifyBatchRelayer(
  contractDeployment: ContractDeployment,
  vaultAddress: string,
  force = false
): Promise<void> {
  if (force || !contractDeployment.predeployed) {
    const previousTask = createNewTask('20220916-batch-relayer-v4');
    await previousTask.verify('BatchRelayerLibrary', contractDeployment.address, contractDeployment.constructorArgs);
    const relayer: string = await contractDeployment.instance.getEntrypoint();
    const relayerArgs = [vaultAddress, contractDeployment.address]; // See BalancerRelayer's constructor
    await previousTask.verify('BalancerRelayer', relayer, relayerArgs);
    await task.save({ BalancerRelayer: relayer });
  }
};
