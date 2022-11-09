// Example Tx - https://etherscan.io/tx/0x9ff77c14e3721a617fe03c3163ddcb1c8688f20cfb351fda227f8c6153a54e58
// https://astraguildventures.medium.com/how-to-participate-in-the-agv-auction-on-copperlaunch-272429af78ae
// https://github.com/balancer-labs/balancer-v2-monorepo/blob/master/pkg/pool-weighted/contracts/lbp/LiquidityBootstrappingPool.sol??

import { ContractDeploymentCollection } from '../../types';
import { ethers, logger, task } from '../../input';
import { BigNumberish, Contract, BigNumber } from 'ethers';
import { AssetHelpers } from '../../utils';
// SOLACE TODO - swap out for wNEAR on production
import { WETH_ADDRESS } from '../../constants';
import { fp } from '@balancer-labs/v2-helpers/src/numbers';
import LBP_ABI from '../../../tasks/2022xxxx-solace-swap/abi/NoProtocolFeeLiquidityBootstrappingPool.json';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { DAY } from '@balancer-labs/v2-helpers/src/time';

export const launchLBP = async function launchLBP(
  contractDeploymentCollection: ContractDeploymentCollection
): Promise<void> {
  const [deployer] = await ethers.getSigners();
  const lbpFactory = contractDeploymentCollection['NoProtocolFeeLiquidityBootstrappingPoolFactory'].instance;
  const token0 = contractDeploymentCollection['HoldrGovernanceToken'].address;
  // SOLACE TODO - swap out for wNEAR on production
  const token1 = contractDeploymentCollection['TestBalancerToken2'].address;

  const assetHelpers = new AssetHelpers(WETH_ADDRESS);
  const tokens = assetHelpers.sortTokens([token0, token1], [fp(0.98), fp(0.02)]);
  const sortedTokens = tokens[0];
  const sortedWeights = tokens[1];

  const createLBPParams: CreateLBPParams = {
    name: 'HLDR->wNEAR Auction Pool',
    symbol: 'HLDR->wNEAR',
    tokens: sortedTokens,
    weights: sortedWeights,
    swapFeePercentage: fp(0.01),
    owner: deployer.address,
    swapEnabledOnStart: true,
  };

  // Launch pool
  const output = task.output({ ensure: false });
  if (output['NoProtocolFeeLiquidityBootstrappingPool'] === undefined) {
    logger.info('Creating LBP pool');
    const tx = await lbpFactory.connect(deployer).create(...Object.values(createLBPParams));
    const log = await tx.wait();
    const poolAddress = log?.events[5].args[0];
    task.save({ ['NoProtocolFeeLiquidityBootstrappingPool']: poolAddress });
    await verifyLBPPool(contractDeploymentCollection, createLBPParams, deployer.address, poolAddress);
    logger.info('Launching LBP');
    await commenceLBP(poolAddress, deployer, sortedWeights);
  }

  // Join pools? Swaps?
};

const verifyLBPPool = async function verifyLBPPool(
  contractDeploymentCollection: ContractDeploymentCollection,
  createLBPParams: CreateLBPParams,
  deployerAddress: string,
  poolAddress: string
) {
  const { pauseWindowDuration, bufferPeriodDuration } = await contractDeploymentCollection[
    'NoProtocolFeeLiquidityBootstrappingPoolFactory'
  ].instance.getPauseConfiguration();

  console.log('pauseWindowDuration: ', pauseWindowDuration);
  console.log('bufferPeriodDuration: ', bufferPeriodDuration);

  const constructorArgsAsStruct: LBPPoolConstructorParams = {
    vault: contractDeploymentCollection['Vault'].address,
    name: createLBPParams.name,
    symbol: createLBPParams.symbol,
    tokens: createLBPParams.tokens,
    normalizedWeights: createLBPParams.weights,
    swapFeePercentage: createLBPParams.swapFeePercentage,
    pauseWindowDuration: pauseWindowDuration,
    bufferPeriodDuration: bufferPeriodDuration,
    owner: deployerAddress,
    swapEnabledOnStart: createLBPParams.swapEnabledOnStart,
  };

  let retries = 0;
  while (retries <= 10) {
    await task.verify('NoProtocolFeeLiquidityBootstrappingPool', poolAddress, Object.values(constructorArgsAsStruct));
    retries += 1;
  }
};

const commenceLBP = async function commenceLBP(
  poolAddress: string,
  provider: SignerWithAddress,
  sortedWeights: BigNumber[]
) {
  const poolInstance = new Contract(poolAddress, LBP_ABI, provider);
  const currentTime = Math.floor(Date.now() / 1000);
  // SOLACE TODO - Adjust params here
  // Setup 3 DAY LBP, starting in 24 hours.
  // 98/2 => 10/90
  await poolInstance.connect(provider).updateWeightsGradually(
    currentTime + 300,
    currentTime + 300 * 3 * DAY,
    sortedWeights.map((weight) => {
      if (weight.eq(fp(0.02))) {
        return fp(0.9);
      } else {
        return fp(0.1);
      }
    })
  );
};

type CreateLBPParams = {
  name: string;
  symbol: string;
  tokens: string[];
  weights: BigNumberish[];
  swapFeePercentage: BigNumberish;
  owner: string;
  swapEnabledOnStart: true;
};

type LBPPoolConstructorParams = {
  vault: string;
  name: string;
  symbol: string;
  tokens: string[];
  normalizedWeights: BigNumberish[];
  swapFeePercentage: BigNumberish;
  pauseWindowDuration: BigNumberish;
  bufferPeriodDuration: BigNumberish;
  owner: string;
  swapEnabledOnStart: boolean;
};
