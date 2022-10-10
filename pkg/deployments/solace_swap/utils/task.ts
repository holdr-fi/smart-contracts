import Task from '../../src/task';
import logger from '../../src/logger';
import { Contract } from 'ethers';

export async function getPredeployedInstance(name: string, task: Task): Promise<Contract | undefined> {
  const output = task.output({ ensure: false });
  if (output[name]) {
    logger.info(`${name} already deployed at ${output[name]}`);
    return task.instanceAt(name, output[name]);
  } else {
    return undefined;
  }
}
