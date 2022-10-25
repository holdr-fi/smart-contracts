import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';
import Task from '../../src/task';
import { Contract } from 'ethers';
import { Param } from '../../src/types';
import { logger } from '../input';
import { deploy } from '../../src/contracts';
import { saveContractDeploymentTransactionHash } from '../../src/network';

export const deployDuplicateContract = async function deployDuplicateContract(
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
