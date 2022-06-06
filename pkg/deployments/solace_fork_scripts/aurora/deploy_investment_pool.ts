// Relevant commit - https://github.com/balancer-labs/balancer-v2-monorepo/tree/26a1dc64e17996c53cfda8ffb4fe42159ef535fa
// Relevant contract - https://etherscan.io/address/0x48767F9F868a4A7b86A90736632F6E44C2df7fa9#code
// https://etherscan.deth.net/address/0x48767F9F868a4A7b86A90736632F6E44C2df7fa9#code

// Good question - is InvestmentPool from Sep 2021, compatible with latest Vault, TimelockAuthorizer and BalancerHelpers?

import { DAY, MONTH } from '@balancer-labs/v2-helpers/src/time';
import { config as dotenv_config } from 'dotenv';
import logger, { Logger } from '../../src/logger';
import Verifier from '../../src/verifier';
import hre from 'hardhat';
import Task, { TaskMode } from '../../src/task';
import hardhat from 'hardhat';
import {
  NewInvestmentPoolParams,
  InvestmentPoolConstructorParams,
  ONE_DAY,
  ONE_HUNDRED_PERCENT,
  ZERO,
  ZERO_ADDRESS,
  getPredeployedInstance,
  AssetHelpers,
  delay,
} from '../utils';
import { BigNumber as BN, Contract } from 'ethers';
import InvestmentPoolABI from '../../tasks/2022xxxx-solace-investment-pool/abi/InvestmentPool.json';
const { ethers } = hardhat;

// Config
dotenv_config();
Logger.setDefaults(false, true); // (silent: true, verbose: false)
const verifier = process.env.ETHERSCAN_API_KEY ? new Verifier(hre.network, process.env.ETHERSCAN_API_KEY) : undefined;
const TASK_ID = '2022xxxx-solace-investment-pool';
const task = new Task(TASK_ID, TaskMode.LIVE, hre.network.name, verifier);

// Vault constants
const ADMIN = '0xC32e0d89e25222ABb4d2d68755baBF5aA6648F15';
const WETH_ADDRESS = '0xc778417E063141139Fce010982780140Aa0cD5Ab';
const pauseWindowDuration = 3 * MONTH;
const bufferPeriodDuration = MONTH;

// Tokens must be deployed ERC20 tokens, with decimals <= 18
// Weights must add up to 1e18
const TOKEN_ADDRESS: { [token: string]: { address: string; weight: BN } } = {
  ['wbtc']: { address: '0x20fB9CDDbcA5a5EB468c76010AEc6eD4eAcc037F', weight: ONE_HUNDRED_PERCENT.div(4) },
  ['weth']: {
    address: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
    weight: ONE_HUNDRED_PERCENT.div(4),
  },
  ['usdc']: { address: '0x6D6DC3A8f02a1fEc0B9575e8dDE4135929Bd6e21', weight: ONE_HUNDRED_PERCENT.div(4) },
  ['frax']: { address: '0x86E5B6485e28E52a0dEEd28Cc10772FeB9c4C400', weight: ONE_HUNDRED_PERCENT.div(4) },
};

// Types
let newPoolParams: NewInvestmentPoolParams;
let pool_deploy_timestamp: BN;

const CONTRACTS: {
  [name: string]: {
    address: string;
    constructor_args: any[];
    predeployed: boolean;
    instance?: Contract;
  };
} = {};

async function main() {
  console.time('script_run_time');

  const [deployer] = await ethers.getSigners();

  // Deploy contracts
  await deployAuthorizer();
  await deployVault();
  await deployBalancerHelpers();
  await deployInvestmentPoolFactory();
  await deployInvestmentPool();

  // Verify contracts
  await verifyContracts();
  await verifyInvestmentPool();

  /*******************
    DEPLOY CLOSURES
  *******************/

  // Define function inside main() so it is like a closure - has access to variables defined in main()
  async function deployAuthorizer(force = false) {
    const CONTRACT_NAME = 'TimelockAuthorizer';
    const CONSTRUCTOR_ARGS = [ADMIN, ZERO_ADDRESS, MONTH];

    let instance: Contract;
    const PREDEPLOYED_INSTANCE = await getPredeployedInstance(CONTRACT_NAME, task);

    // If force == true, forced deploy. Otherwise only deploy if PREDEPLOYED_INSTANCE == undefined
    if (force || !PREDEPLOYED_INSTANCE) {
      instance = await task.deploy(CONTRACT_NAME, CONSTRUCTOR_ARGS, deployer);
    } else {
      instance = PREDEPLOYED_INSTANCE;
    }

    CONTRACTS[CONTRACT_NAME] = {
      address: instance.address,
      constructor_args: CONSTRUCTOR_ARGS,
      // If force == true, predeployed = false, otherwise false if !PREDEPLOYED_INSTANCE
      predeployed: force || !PREDEPLOYED_INSTANCE ? false : true,
      instance: instance,
    };
  }

  async function deployVault(force = false) {
    const CONTRACT_NAME = 'Vault';

    const CONSTRUCTOR_ARGS = [
      CONTRACTS['TimelockAuthorizer'].address,
      WETH_ADDRESS,
      pauseWindowDuration,
      bufferPeriodDuration,
    ];

    const PREDEPLOYED_INSTANCE = await getPredeployedInstance(CONTRACT_NAME, task);

    let instance: Contract;

    if (force || !PREDEPLOYED_INSTANCE) {
      instance = await task.deploy(CONTRACT_NAME, CONSTRUCTOR_ARGS, deployer);
    } else {
      instance = PREDEPLOYED_INSTANCE;
    }

    CONTRACTS[CONTRACT_NAME] = {
      address: instance.address,
      constructor_args: CONSTRUCTOR_ARGS,
      predeployed: force || !PREDEPLOYED_INSTANCE ? false : true,
      instance: instance,
    };
  }

  async function deployBalancerHelpers(force = false) {
    const CONTRACT_NAME = 'BalancerHelpers';
    const CONSTRUCTOR_ARGS = [CONTRACTS['Vault'].address];

    const PREDEPLOYED_INSTANCE = await getPredeployedInstance(CONTRACT_NAME, task);

    let instance: Contract;

    if (force || !PREDEPLOYED_INSTANCE) {
      instance = await task.deploy(CONTRACT_NAME, CONSTRUCTOR_ARGS, deployer);
    } else {
      instance = PREDEPLOYED_INSTANCE;
    }

    CONTRACTS[CONTRACT_NAME] = {
      address: instance.address,
      constructor_args: CONSTRUCTOR_ARGS,
      predeployed: force || !PREDEPLOYED_INSTANCE ? false : true,
      instance: instance,
    };
  }

  async function deployInvestmentPoolFactory(force = false) {
    const CONTRACT_NAME = 'InvestmentPoolFactory';
    const CONSTRUCTOR_ARGS = [CONTRACTS['Vault'].address];

    const PREDEPLOYED_INSTANCE = await getPredeployedInstance(CONTRACT_NAME, task);

    let instance: Contract;

    if (force || !PREDEPLOYED_INSTANCE) {
      instance = await task.deploy(CONTRACT_NAME, CONSTRUCTOR_ARGS, deployer);
    } else {
      instance = PREDEPLOYED_INSTANCE;
    }

    CONTRACTS[CONTRACT_NAME] = {
      address: instance.address,
      constructor_args: CONSTRUCTOR_ARGS,
      predeployed: force || !PREDEPLOYED_INSTANCE ? false : true,
      instance: instance,
    };
  }

  async function deployInvestmentPool(force = false) {
    const CONTRACT_NAME = 'InvestmentPool';

    // Create arguments for InvestmentPoolFactory.create()
    const assetHelpers = new AssetHelpers(WETH_ADDRESS);
    let tokens: string[] = [];
    let weights: BN[] = [];

    for (const entry in TOKEN_ADDRESS) {
      tokens.push(TOKEN_ADDRESS[entry].address);
      weights.push(TOKEN_ADDRESS[entry].weight);
    }

    if (!weights.reduce((prev, current) => prev.add(current)).eq(ONE_HUNDRED_PERCENT)) {
      logger.error('Token weights do not add up to exactly 100%');
      return;
    }

    [tokens, weights] = assetHelpers.sortTokens(tokens, weights);

    newPoolParams = {
      name: 'Solace Managed Pool', // OK
      symbol: 'SMP', // OK
      tokens: tokens,
      weights: weights,
      swapFeePercentage: ONE_HUNDRED_PERCENT.mul(3).div(1000), // 0.3% - OK
      owner: ADMIN,
      swapEnabledOnStart: true,
      managementSwapFeePercentage: ONE_HUNDRED_PERCENT.div(2),
    };

    if (CONTRACTS['InvestmentPoolFactory'].instance) {
      const tx = await CONTRACTS['InvestmentPoolFactory'].instance
        .connect(deployer)
        .create(
          newPoolParams.name,
          newPoolParams.symbol,
          newPoolParams.tokens,
          newPoolParams.weights,
          newPoolParams.swapFeePercentage,
          newPoolParams.owner,
          newPoolParams.swapEnabledOnStart,
          newPoolParams.managementSwapFeePercentage
        );

      const log = await tx.wait();

      if (log.events && log.events[0] && log.events[0].address && deployer.provider) {
        const MANAGED_POOL_ADDRESS = log.events[0].address;
        logger.success(`Deployed ManagedPool at ${MANAGED_POOL_ADDRESS}`);

        const pool_deploy_block = log.blockNumber;
        const { timestamp } = await deployer.provider.getBlock(pool_deploy_block);
        pool_deploy_timestamp = BN.from(timestamp);

        CONTRACTS[CONTRACT_NAME] = {
          address: MANAGED_POOL_ADDRESS,
          constructor_args: [],
          predeployed: false,
        };
      }
    } else {
      logger.error('Could not find InvestmentPoolFactory instance');
    }
  }

  /*******************
    VERIFY CLOSURE
  *******************/

  async function verifyContracts(force = false) {
    if (force || !CONTRACTS['TimelockAuthorizer'].predeployed) {
      await task.verify(
        'TimelockAuthorizer',
        CONTRACTS['TimelockAuthorizer'].address,
        CONTRACTS['TimelockAuthorizer'].constructor_args
      );
    }

    if (force || !CONTRACTS['Vault'].predeployed) {
      await task.verify('Vault', CONTRACTS['Vault'].address, CONTRACTS['Vault'].constructor_args);
    }

    if (force || !CONTRACTS['BalancerHelpers'].predeployed) {
      await task.verify(
        'BalancerHelpers',
        CONTRACTS['BalancerHelpers'].address,
        CONTRACTS['BalancerHelpers'].constructor_args
      );
    }

    if (force || !CONTRACTS['InvestmentPoolFactory'].predeployed) {
      await task.verify(
        'InvestmentPoolFactory',
        CONTRACTS['InvestmentPoolFactory'].address,
        CONTRACTS['InvestmentPoolFactory'].constructor_args
      );
    }
  }

  async function verifyInvestmentPool(force = false) {
    const instance = new ethers.Contract(CONTRACTS['InvestmentPool'].address, InvestmentPoolABI, deployer.provider);
    const [, pauseWindowEndTime, bufferPeriodEndTime] = await instance.getPausedState();
    const assetManagers: string[] = Array(newPoolParams.tokens.length).fill(ZERO_ADDRESS);

    const pauseWindowDuration = pauseWindowEndTime.sub(pool_deploy_timestamp);
    const bufferPeriodDuration = bufferPeriodEndTime.sub(pauseWindowEndTime);

    const CONSTRUCTOR_ARGS: InvestmentPoolConstructorParams[] = [
      {
        vault: CONTRACTS['Vault'].address,
        name: newPoolParams.name,
        symbol: newPoolParams.symbol,
        tokens: newPoolParams.tokens,
        normalizedWeights: newPoolParams.weights,
        assetManagers: assetManagers,
        swapFeePercentage: newPoolParams.swapFeePercentage,
        pauseWindowDuration: BN.from(pauseWindowDuration),
        bufferPeriodDuration: BN.from(bufferPeriodDuration),
        owner: newPoolParams.owner,
        swapEnabledOnStart: newPoolParams.swapEnabledOnStart,
        managementSwapFeePercentage: newPoolParams.managementSwapFeePercentage,
      },
    ];

    let retries = 0;
    while (retries <= 3) {
      try {
        await task.verify('InvestmentPool', CONTRACTS['InvestmentPool'].address, CONSTRUCTOR_ARGS);
        break;
      } catch {
        logger.error('Failed to verify InvestmentPool, retrying in 30 seconds');
        retries += 1;
        await delay(30000);
      }
    }
  }
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
