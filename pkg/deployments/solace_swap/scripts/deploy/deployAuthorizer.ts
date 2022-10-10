import { WEEK } from '@balancer-labs/v2-helpers/src/time';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';
import { ADMIN, ZERO_ADDRESS } from '../../constants';
import { Contract } from 'ethers';
import { getPredeployedInstance } from '../../utils/task';
import { task } from '../../input';
import { ContractDeployment } from '../../types';

const contractName = 'TimelockAuthorizer';
const constructorArgs = [ADMIN, ZERO_ADDRESS, WEEK];

export const deployAuthorizer = async function deployAuthorizer(
  deployer: SignerWithAddress,
  force = false
): Promise<ContractDeployment> {
  let instance: Contract;
  const predeployedInstance = await getPredeployedInstance(contractName, task);

  // If force == true, forced deploy. Otherwise only deploy if PREDEPLOYED_INSTANCE == undefined
  if (force || !predeployedInstance) {
    instance = await task.deploy(contractName, constructorArgs, deployer);
  } else {
    instance = predeployedInstance;
  }

  const deployment: ContractDeployment = {
    name: contractName,
    address: instance.address,
    constructor_args: constructorArgs,
    // If force == true, predeployed = false, otherwise false if !PREDEPLOYED_INSTANCE
    predeployed: force || !predeployedInstance ? false : true,
    instance: instance,
  };

  return deployment;
};
