import { Contract } from 'ethers';
import { task, ethers } from '../../input';
import { ContractDeployment } from '../../types';

export const deployVotingEscrow = async function deployVotingEscrow(
  authorizerAdaptorAddress: string,
  force = false
): Promise<ContractDeployment> {
  const output = task.output({ ensure: false });
  const contractName = 'VotingEscrow';
  const constructorArgs = [output['SPT'], 'Vote Escrowed SPT', 'veSWP', authorizerAdaptorAddress];
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
