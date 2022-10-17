import { Contract } from 'ethers';
import { task, ethers } from '../../input';
import { ContractDeployment } from '../../types';

export const deployRewardDistributor = async function deployRewardDistributor(
  bribeVaultDeploymentAddress: string,
  force = false
): Promise<ContractDeployment> {
  const [deployer] = await ethers.getSigners();
  const contractName = 'RewardDistributor';
  const constructorArgs = [bribeVaultDeploymentAddress];
  let instance: Contract;
  const predeployedInstance = await task.getPredeployedInstance(contractName);

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
