import { Contract } from 'ethers';
import { getPredeployedInstance } from '../../utils/task';
import { task } from '../../input';
import { ContractDeployment } from '../../types';
import { ethers } from '../../input';

export const deployTokenAdmin = async function deployTokenAdmin(
  vaultDeploymentAddress: string,
  tokenDeploymentAddress: string,
  force = false
): Promise<ContractDeployment> {
  const contractName = 'BalancerTokenAdmin';
  const constructorArgs = [vaultDeploymentAddress, tokenDeploymentAddress];
  let instance: Contract;
  const predeployedInstance = await getPredeployedInstance(contractName, task);
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
