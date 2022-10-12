import { Contract } from 'ethers';
import { getPredeployedInstance } from '../../utils/task';
import { task } from '../../input';
import { ContractDeployment } from '../../types';
import { ethers } from './../../input';

export const deployAuthorizer = async function deployAuthorizer(force = false): Promise<ContractDeployment> {
  const [deployer] = await ethers.getSigners();
  const contractName = 'Authorizer';
  const constructorArgs = [deployer.address];
  let instance: Contract;
  const predeployedInstance = await getPredeployedInstance(contractName, task);

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
