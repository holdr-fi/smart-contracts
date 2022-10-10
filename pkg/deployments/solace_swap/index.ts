import { ethers } from './input';
import { deploySolaceSwapContracts } from './scripts';

async function main() {
  console.time('script_run_time');
  const [deployer] = await ethers.getSigners();
  await deploySolaceSwapContracts(deployer);
  //   await verifySolaceSwapContracts();
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
