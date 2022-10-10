import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';
import { ADMIN } from '../../constants';
import { Contract } from 'ethers';
import { task } from '../../input';
import { ContractDeployment } from '../../types';
import { ethers, logger } from '../../input';
import { deploy } from '../../../src/contracts';
import { Param } from '../../../src/types';
import { saveContractDeploymentTransactionHash } from '../../../src/network';
import Task from '../../../src/task';

export const deployToken2 = async function deployToken2(force = false): Promise<ContractDeployment> {
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

const deployDuplicateContract = async function deployDuplicateContract(
  name: string,
  artifactName: string,
  args: Array<Param> = [],
  from: SignerWithAddress,
  task: Task
): Promise<Contract> {
  let instance: Contract;
  const output = task.output({ ensure: false });
  if (!output[name]) {
    instance = await deploy(task.artifact(artifactName), args, from);
    task.save({ [name]: instance });
    logger.success(`Deployed ${name} at ${instance.address}`);
    await saveContractDeploymentTransactionHash(instance.address, instance.deployTransaction.hash, task.network);
  } else {
    logger.info(`${name} already deployed at ${output[name]}`);
    instance = await task.instanceAt(name, output[name]);
  }

  return instance;
};

const getPredeployedInstanceForDuplicate = async function getPredeployedInstanceForDuplicate(
  name: string,
  artifactName: string,
  task: Task
): Promise<Contract | undefined> {
  const output = task.output({ ensure: false });
  if (output[name]) {
    logger.info(`${name} already deployed at ${output[name]}`);
    return task.instanceAt(artifactName, output[name]);
  } else {
    return undefined;
  }
};
