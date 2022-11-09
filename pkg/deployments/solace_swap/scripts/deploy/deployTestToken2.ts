import { ADMIN } from '../../constants';
import { Contract } from 'ethers';
import { ContractDeployment } from '../../types';
import { deployDuplicateContract, getPredeployedInstanceForDuplicate } from '../../utils';
import { task, ethers } from '../../input';

export const deployTestToken2 = async function deployTestToken2(force = false): Promise<ContractDeployment> {
  const artifactName = 'TestBalancerToken';
  const contractName = 'TestBalancerToken2';
  const constructorArgs = [ADMIN, 'ETH', 'ETH'];
  let instance: Contract;
  const predeployedInstance = await getPredeployedInstanceForDuplicate(contractName, artifactName, task);
  const [deployer] = await ethers.getSigners();

  // If force == true, forced deploy. Otherwise only deploy if PREDEPLOYED_INSTANCE == undefined
  if (force || !predeployedInstance) {
    // instance = await task.deploy(contractName, constructorArgs, deployer);
    instance = await deployDuplicateContract(contractName, artifactName, constructorArgs, deployer, task);
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
