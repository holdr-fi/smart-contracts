// Could not get deploying ManagedPool.sol to work, seems like it is impossible
// on testnet currently (6 June 2022) as it exceeds the EIP-170 contract size limit
// by 150%

import { DAY, MONTH } from '@balancer-labs/v2-helpers/src/time';
import { config as dotenv_config } from 'dotenv';
import logger, { Logger } from '../../src/logger';
import Verifier from '../../src/verifier';
import hre from 'hardhat';
import Task, { TaskMode } from '../../src/task';
import hardhat from 'hardhat';
import {
  NewManagedPoolParams,
  BasePoolRights,
  ManagedPoolRights,
  CreateManagedPoolArgs,
  ONE_DAY,
  ONE_HUNDRED_PERCENT,
  ZERO,
  ZERO_ADDRESS,
  getPredeployedInstance,
  AssetHelpers,
} from '../utils';
import { BigNumber as BN, Contract } from 'ethers';
const { ethers } = hardhat;

// Config
dotenv_config();
Logger.setDefaults(false, true); // (silent: true, verbose: false)
const verifier = process.env.ETHERSCAN_API_KEY ? new Verifier(hre.network, process.env.ETHERSCAN_API_KEY) : undefined;
const TASK_ID = '2022xxxx-solace-managed-pool';
const task = new Task(TASK_ID, TaskMode.LIVE, hre.network.name, verifier);

// Constants
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
  await deployBaseManagedPoolFactory();
  await deployManagedPoolFactory();
  await verifyContracts();
  await verifyProtocolFeeCollector(); // Help with Tenderly debugging
  await deployManagedPool();

  // Verify contracts

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

  async function deployBaseManagedPoolFactory(force = false) {
    const CONTRACT_NAME = 'BaseManagedPoolFactory';
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

  async function deployManagedPoolFactory(force = false) {
    const CONTRACT_NAME = 'ManagedPoolFactory';
    const CONSTRUCTOR_ARGS = [CONTRACTS['BaseManagedPoolFactory'].address];

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

  async function deployManagedPool(force = false) {
    const CONTRACT_NAME = 'ManagedPool';

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

    const assetManagers: string[] = Array(tokens.length).fill(ZERO_ADDRESS);

    if (!CONTRACTS['BaseManagedPoolFactory'].instance) {
      logger.error('Could not find BaseManagedPoolFactory instance');
      return;
    }

    const protocolFeesCollector = await CONTRACTS['BaseManagedPoolFactory'].instance
      .connect(deployer)
      .getAumProtocolFeesCollector();

    const newPoolParams: NewManagedPoolParams = {
      name: 'Solace Managed Pool', // OK
      symbol: 'SMP', // OK
      tokens: tokens,
      normalizedWeights: weights,
      assetManagers: assetManagers,
      swapFeePercentage: ONE_HUNDRED_PERCENT.mul(3).div(1000), // 0.3% - OK
      swapEnabledOnStart: true,
      mustAllowlistLPs: false,
      protocolSwapFeePercentage: ONE_HUNDRED_PERCENT.div(2),
      managementSwapFeePercentage: ONE_HUNDRED_PERCENT.div(2),
      managementAumFeePercentage: ONE_HUNDRED_PERCENT.div(100),
      aumProtocolFeesCollector: protocolFeesCollector,
    };

    const basePoolRights: BasePoolRights = {
      canTransferOwnership: true,
      canChangeSwapFee: true,
      canUpdateMetadata: true,
    };

    const managedPoolRights: ManagedPoolRights = {
      canChangeWeights: true,
      canDisableSwaps: true,
      canSetMustAllowlistLPs: true,
      canSetCircuitBreakers: true,
      canChangeTokens: true,
      canChangeMgmtFees: true,
    };

    const CREATE_MANAGED_POOL_ARGS: CreateManagedPoolArgs = [
      newPoolParams,
      basePoolRights, // APPEAR OK
      managedPoolRights, // APPEAR OK
      DAY, // APPEAR OK
      ADMIN,
    ];

    // Change our pattern here, because we are calling ManagedPoolFactory.create()

    if (CONTRACTS['ManagedPoolFactory'].instance) {
      const log = await CONTRACTS['ManagedPoolFactory'].instance
        .connect(deployer)
        .create(...CREATE_MANAGED_POOL_ARGS, { gasLimit: 22000000 });

      console.log(log);
    } else {
      logger.error('Could not find ManagedPoolFactory instance');
    }

    // const PREDEPLOYED_INSTANCE = await getPredeployedInstance(CONTRACT_NAME, task);

    // const instance = PREDEPLOYED_INSTANCE
    //   ? PREDEPLOYED_INSTANCE
    //   : await task.deploy(CONTRACT_NAME, CONSTRUCTOR_ARGS, deployer);

    // CONTRACTS[CONTRACT_NAME] = {
    //   address: instance.address,
    //   constructor_args: CONSTRUCTOR_ARGS,
    //   predeployed: force || !PREDEPLOYED_INSTANCE ? false : true,
    //   instance: instance,
    // };
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

    if (force || !CONTRACTS['BaseManagedPoolFactory'].predeployed) {
      await task.verify(
        'BaseManagedPoolFactory',
        CONTRACTS['BaseManagedPoolFactory'].address,
        CONTRACTS['BaseManagedPoolFactory'].constructor_args
      );
    }

    if (force || !CONTRACTS['ManagedPoolFactory'].predeployed) {
      await task.verify(
        'ManagedPoolFactory',
        CONTRACTS['ManagedPoolFactory'].address,
        CONTRACTS['ManagedPoolFactory'].constructor_args
      );
    }

    // if (force || !CONTRACTS['ManagedPool'].predeployed) {
    //   await task.verify('ManagedPool', CONTRACTS['ManagedPool'].address, CONTRACTS['ManagedPool'].constructor_args);
    // }
  }

  async function verifyProtocolFeeCollector(force = false) {
    if (force && CONTRACTS['BaseManagedPoolFactory'].instance) {
      const protocolFeesCollector = await CONTRACTS['BaseManagedPoolFactory'].instance
        .connect(deployer)
        .getAumProtocolFeesCollector();

      const CONSTRUCTOR_ARGS = [CONTRACTS['Vault'].address];
      await task.verify('AumProtocolFeesCollector', protocolFeesCollector, CONSTRUCTOR_ARGS);
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
