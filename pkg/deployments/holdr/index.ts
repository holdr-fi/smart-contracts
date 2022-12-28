import { providers } from 'ethers';
import {
  deployHoldrContracts,
  verifyHoldrContracts,
  setupVotingEscrowSystem,
  setupBribingSystem,
  updateBribes,
  setupLBP,
  getMultiSigTx,
} from './scripts';
import { verifyLBPPool } from './scripts/verify';
import { ContractDeploymentCollection } from './types';
import { verifyContractFromMainnet } from './utils';

async function main() {
  console.time('script_run_time');
  const contractDeploymentCollection: ContractDeploymentCollection = await deployHoldrContracts();
  // await verifyHoldrContracts(contractDeploymentCollection, true);

  await setupVotingEscrowSystem(contractDeploymentCollection);
  // await setupBribingSystem(contractDeploymentCollection);
  // await updateBribes(contractDeploymentCollection);
  // await setupLBP(contractDeploymentCollection);
  // await getMultiSigTx(contractDeploymentCollection);
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
