import {
  deployHoldrContracts,
  verifyHoldrContracts,
  setupVotingEscrowSystem,
  setupBribingSystem,
  updateBribes,
  setupLBP,
} from './scripts';
import { ContractDeploymentCollection } from './types';
import { verifyContractFromMainnet } from './utils';

async function main() {
  console.time('script_run_time');
  // await verifyContractFromMainnet(
  //   '0xcC508a455F5b0073973107Db6a878DdBDab957bC',
  //   // '0xDD1591D7BdF0E3ddEa4b4377cf03373700BED38e',
  //   '0x6eEc5D0A3110adb7521C5Ea11A1057CAc90F600F',
  //   // '000000000000000000000000364d44dFc31b3d7b607797B514348d57Ad0D784E00000000000000000000000090dC08c4474D3Ea36bF4e65589D83c54C3A44395'
  //   '0000000000000000000000007e5d79d67a1dac16e8024b99c4b8a8ec37c5ea2b0000000000000000000000008ba291aae44b95939cedcf6a5c379af64f7600fc'
  // );

  const contractDeploymentCollection: ContractDeploymentCollection = await deployHoldrContracts();
  await verifyHoldrContracts(contractDeploymentCollection, true);
  // await setupVotingEscrowSystem(contractDeploymentCollection);
  // await setupBribingSystem(contractDeploymentCollection);
  // await updateBribes(contractDeploymentCollection);
  // await setupLBP(contractDeploymentCollection);
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
