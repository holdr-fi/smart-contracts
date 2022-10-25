import {
  deploySolaceSwapContracts,
  verifySolaceSwapContracts,
  setupVotingEscrowSystem,
  setupBribingSystem,
  updateBribes,
} from './scripts';
import { ContractDeploymentCollection } from './types';

async function main() {
  console.time('script_run_time');
  const contractDeploymentCollection: ContractDeploymentCollection = await deploySolaceSwapContracts();
  // await verifySolaceSwapContracts(contractDeploymentCollection, true);
  // await setupVotingEscrowSystem(contractDeploymentCollection);
  // await setupBribingSystem(contractDeploymentCollection);
  await updateBribes(contractDeploymentCollection);
}

main()
  .then(() => {
    console.log('SUCCESS!');
    console.timeEnd('script_run_time');
  })
  .catch((e) => {
    console.error(e);
    console.log('FAILED!');
    console.timeEnd('script_run_time');
  });
