import { deploySolaceSwapContracts, verifySolaceSwapContracts, setupVotingEscrowSystem } from './scripts';
import { ContractDeploymentCollection } from './types';

async function main() {
  console.time('script_run_time');
  const contractDeploymentCollection: ContractDeploymentCollection = await deploySolaceSwapContracts();
  // await verifySolaceSwapContracts(contractDeploymentCollection, true);
  await setupVotingEscrowSystem(contractDeploymentCollection);
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
