import { Contract } from 'ethers';
import { task, ethers } from '../../input';
import { DESIRED_FEE_STARTTIME } from '../../constants';
import { ContractDeployment } from '../../types';

export const deployFeeDistributor = async function deployFeeDistributor(
  votingEscrowDeploymentAddress: string,
  force = false
): Promise<ContractDeployment> {
  const [deployer] = await ethers.getSigners();
  const contractName = 'FeeDistributor';

  // Need to provide startTime >= current timestamp, and there is an extra check if startTime is in within the current week.
  const constructorArgs = [votingEscrowDeploymentAddress, DESIRED_FEE_STARTTIME];
  let instance: Contract;
  const predeployedInstance = await task.getPredeployedInstance(contractName);

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
