import { ContractDeploymentCollection } from '../types';
import { verifyAuthorizer, verifyVault } from './verify';

export const verifySolaceSwapContracts = async function verifySolaceSwapContracts(
  contractDeploymentCollection: ContractDeploymentCollection,
  force = false
): Promise<void> {
  await verifyAuthorizer(contractDeploymentCollection['TimelockAuthorizer'], force);
  // await verifyVault(contractDeploymentCollection['Vault'], force);
};
