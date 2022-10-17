import { Contract } from 'ethers';
import { task, ethers } from '../../input';
import { ContractDeployment } from '../../types';

export const deployGaugeController = async function deployGaugeController(
  veTokenDeploymentAddress: string,
  authorizerAdaptorDeploymentAddress: string,
  force = false
): Promise<ContractDeployment> {
  const contractName = 'GaugeController';
  const constructorArgs = [veTokenDeploymentAddress, authorizerAdaptorDeploymentAddress];
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
