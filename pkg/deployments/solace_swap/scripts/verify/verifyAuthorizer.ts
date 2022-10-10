import { ContractDeployment } from '../../types';
import { createNewTask, task } from '../../input';
import Task from '../../../src/task';

// const taskID = '20220704-timelock-authorizer';
// const task: Task = createNewTask(taskID);

export const verifyAuthorizer = async function verifyAuthorizer(
  contractDeployment: ContractDeployment,
  force = false
): Promise<void> {
  if (force || !contractDeployment.predeployed) {
    console.log('verifyAuthorizer');
    await task.verify('TimelockAuthorizer', contractDeployment.address, contractDeployment.constructorArgs);
  }
};
