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
  // await setupVotingEscrowSystem(contractDeploymentCollection);
  // await setupBribingSystem(contractDeploymentCollection);
  // await updateBribes(contractDeploymentCollection);
  // await setupLBP(contractDeploymentCollection);
  await getMultiSigTx(contractDeploymentCollection);
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

// curl https://mainnet.aurora.dev \
// -X POST \
// -H "Content-Type: application/json" \
// --data '{"method":"eth_getCode","params":["0x036FccF87004E9Ef3301BA6F9081d82f81a304d2","latest"],"id":1,"jsonrpc":"2.0"}'

// curl https://mainnet.aurora.dev \
// -X POST \
// -H "Content-Type: application/json" \
// --data '{"method":"eth_call","params":[{"from":"0xC32e0d89e25222ABb4d2d68755baBF5aA6648F15","to":"0x7307fd468B75698eD59d53DB20d697C68dF9c816","data":"0x38fff2d0"}, "latest"],"id":1,"jsonrpc":"2.0"}'

