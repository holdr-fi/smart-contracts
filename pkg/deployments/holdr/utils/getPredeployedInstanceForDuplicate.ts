import Task from '../../src/task';
import { Contract } from 'ethers';
import { logger } from '../input';

export const getPredeployedInstanceForDuplicate = async function getPredeployedInstanceForDuplicate(
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
