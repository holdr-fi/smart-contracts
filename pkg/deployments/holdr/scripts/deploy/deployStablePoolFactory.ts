import { Contract } from 'ethers';
import { task, ethers } from '../../input';
import { ContractDeployment } from '../../types';

export const deployStablePoolFactory = async function deployStablePoolFactory(
  vaultDeploymentAddress: string,
  protocolFeePercentagesProviderDeploymentAddress: string,
  force = false
): Promise<ContractDeployment> {
  const contractName = 'ComposableStablePoolFactory';
  const constructorArgs = [
    vaultDeploymentAddress,
    protocolFeePercentagesProviderDeploymentAddress,
    '{"name":"ComposableStablePoolFactory","version":3,"deployment":"20230206-composable-stable-pool-v3"}',
    '{"name":"ComposableStablePool","version":3,"deployment":"20230206-composable-stable-pool-v3"}',
  ];
  let instance: Contract;
  const predeployedInstance = await task.getPredeployedInstance(contractName);
  const [deployer] = await ethers.getSigners();

  // If force == true, forced deploy. Otherwise only deploy if PREDEPLOYED_INSTANCE == undefined
  if (force || !predeployedInstance) {
    instance = await task.deploy(contractName, constructorArgs, deployer);
  } else {
    instance = predeployedInstance;
  }

  const deployment: ContractDeployment = {
    name: contractName,
    address: instance.address,
    constructorArgs: constructorArgs,
    // If force == true, predeployed = false, otherwise false if !PREDEPLOYED_INSTANCE
    predeployed: force || !predeployedInstance ? false : true,
    instance: instance,
  };

  return deployment;
};
