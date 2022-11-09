import { ADMIN } from '../../constants';
import { Contract } from 'ethers';
import { task, ethers } from '../../input';
import { ContractDeployment } from '../../types';

// TO-DO Rename to 'Hodlr Governance Token', 'HLDR' for Aurora deployment
// TO-DO Work out initial supply and emission dynamics
export const deployTestToken = async function deployTestToken(force = false): Promise<ContractDeployment> {
  const contractName = 'TestBalancerToken';
  const constructorArgs = [ADMIN, 'Solace Swap Governance Token', 'SWP'];
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
