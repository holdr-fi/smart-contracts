import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';
import { deployAuthorizer } from './deploy';
import { ContractDeploymentCollection } from '../types';

export const deploySolaceSwapContracts = async function deploySolaceSwapContracts(
  deployer: SignerWithAddress
): Promise<ContractDeploymentCollection> {
  const contractDeploymentCollection: ContractDeploymentCollection = {};

  const authorizerDeployment = await deployAuthorizer(deployer);
  contractDeploymentCollection[authorizerDeployment.name] = authorizerDeployment;

  return contractDeploymentCollection;
};
