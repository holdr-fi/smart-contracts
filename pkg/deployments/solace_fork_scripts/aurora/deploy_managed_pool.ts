import { MONTH } from '@balancer-labs/v2-helpers/src/time';
import { delay } from '../utils';
import { config as dotenv_config } from 'dotenv';
import { Logger } from '../../src/logger';
import Verifier from '../../src/verifier';
import hre from 'hardhat';
import Task, { TaskMode } from '../../src/task';
import hardhat from 'hardhat';
const { ethers } = hardhat;

// Config
dotenv_config();
Logger.setDefaults(false, true); // (silent: true, verbose: false)
const verifier = process.env.ETHERSCAN_API_KEY ? new Verifier(hre.network, process.env.ETHERSCAN_API_KEY) : undefined;
const TASK_ID = '2022xxxx-solace-managed-pool';
const task = new Task(TASK_ID, TaskMode.LIVE, hre.network.name, verifier);

async function main() {
  console.time('script_run_time');

  const [deployer] = await ethers.getSigners();

  // Deploy Authorizer
  const ADMIN = '0xC32e0d89e25222ABb4d2d68755baBF5aA6648F15';
  const AUTHORIZER_CONSTRUCTOR_ARGS = [ADMIN];
  const authorizerInstance = await task.deploy('Authorizer', AUTHORIZER_CONSTRUCTOR_ARGS, deployer);
  // await delay(15000); // Wait 15 seconds for contract code to be deployed to address
  // await authorizerTask.deployAndVerify('Authorizer', AUTHORIZER_CONSTRUCTOR_ARGS, deployer, true);

  // Deploy Vault
  const WETH = '0xdFCeA9088c8A88A76FF74892C1457C17dfeef9C1';
  const pauseWindowDuration = 3 * MONTH;
  const bufferPeriodDuration = MONTH;
  const VAULT_CONSTRUCTOR_ARGS = [authorizerInstance.address, WETH, pauseWindowDuration, bufferPeriodDuration];
  const vaultInstance = await task.deploy('Vault', VAULT_CONSTRUCTOR_ARGS, deployer);
  // await delay(15000); // Wait 15 seconds for contract code to be deployed to address

  // Deploy BalancerHelpers
  const BALANCER_HELPERS_CONSTRUCTOR_ARGS = [vaultInstance.address];
  const balancerHelpersInstance = await task.deploy('BalancerHelpers', BALANCER_HELPERS_CONSTRUCTOR_ARGS, deployer);
  // await delay(15000); // Wait 15 seconds for contract code to be deployed to address

  // Deploy ManagedPoolFactory
  const MANAGED_POOL_FACTORY_CONSTRUCTOR_ARGS = [vaultInstance.address];
  const managedPoolFactoryInstance = await task.deploy(
    'ManagedPoolFactory',
    MANAGED_POOL_FACTORY_CONSTRUCTOR_ARGS,
    deployer
  );

  // Verify contracts on Etherscan
  await task.verify('Authorizer', authorizerInstance.address, AUTHORIZER_CONSTRUCTOR_ARGS);
  await task.verify('Vault', vaultInstance.address, VAULT_CONSTRUCTOR_ARGS);
  await task.verify('BalancerHelpers', balancerHelpersInstance.address, BALANCER_HELPERS_CONSTRUCTOR_ARGS);
  await task.verify('ManagedPoolFactory', managedPoolFactoryInstance.address, MANAGED_POOL_FACTORY_CONSTRUCTOR_ARGS);
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
