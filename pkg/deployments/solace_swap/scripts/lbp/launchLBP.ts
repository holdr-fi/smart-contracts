// Example Tx - https://etherscan.io/tx/0x9ff77c14e3721a617fe03c3163ddcb1c8688f20cfb351fda227f8c6153a54e58
// https://astraguildventures.medium.com/how-to-participate-in-the-agv-auction-on-copperlaunch-272429af78ae
// https://github.com/balancer-labs/balancer-v2-monorepo/blob/master/pkg/pool-weighted/contracts/lbp/LiquidityBootstrappingPool.sol??

import { ContractDeploymentCollection } from '../../types';
import { JoinPoolRequest } from '@balancer-labs/balancer-js';
import { ethers, logger, task } from '../../input';
import { BigNumberish, Contract, BigNumber } from 'ethers';
import { AssetHelpers, ONE_ETHER, ZERO } from '../../utils';
// SOLACE TODO - swap out for wNEAR on production
import { WETH_ADDRESS, MAX_UINT256, ONE_MILLION_ETHER } from '../../constants';
import { fp } from '@balancer-labs/v2-helpers/src/numbers';
import LBP_ABI from '../../../tasks/2022xxxx-solace-swap/abi/NoProtocolFeeLiquidityBootstrappingPool.json';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { DAY } from '@balancer-labs/v2-helpers/src/time';
const { defaultAbiCoder } = ethers.utils;

export const launchLBP = async function launchLBP(
  contractDeploymentCollection: ContractDeploymentCollection
): Promise<void> {
  const [deployer] = await ethers.getSigners();
  const lbpFactory = contractDeploymentCollection['NoProtocolFeeLiquidityBootstrappingPoolFactory'].instance;
  const hldr = contractDeploymentCollection['HoldrGovernanceToken'].instance;
  // SOLACE TODO - swap out for wNEAR on production
  const token1 = contractDeploymentCollection['TestBalancerToken2'].instance;

  const assetHelpers = new AssetHelpers(WETH_ADDRESS);
  const tokens = assetHelpers.sortTokens([hldr.address, token1.address], [fp(0.98), fp(0.02)]);
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

  // Mint self 35M HLDR
  const vault = contractDeploymentCollection['Vault'].instance;

  if ((await hldr.balanceOf(deployer.address)).eq(ZERO)) {
    logger.info('Minting self 35M HLDR tokens');
    // SOLACE TODO - Do we need to change mint number?
    await hldr.connect(deployer).mint(deployer.address, ONE_MILLION_ETHER.mul(35));
  }

  if ((await token1.balanceOf(deployer.address)).lt(ONE_MILLION_ETHER)) {
    logger.info('Minting self 35M ETH tokens');
    // SOLACE TODO - Do we need to change mint number?
    await token1.connect(deployer).mint(deployer.address, ONE_MILLION_ETHER.mul(35));
  }

  // Launch initial liquidity
  const poolInstance = new Contract(output['NoProtocolFeeLiquidityBootstrappingPool'], LBP_ABI, deployer);
  if ((await poolInstance.balanceOf(deployer.address)).eq(ZERO)) {
    await provideInitialLiquidity(poolInstance, vault, hldr, token1, ONE_ETHER.mul(100000), deployer);
  }

  // Let people swap
  // Exit pool
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

const provideInitialLiquidity = async function provideInitialLiquidity(
  poolContract: Contract,
  vaultContract: Contract,
  token0: Contract,
  token1: Contract,
  initialLiquidityToken0: BigNumber,
  provider: SignerWithAddress
) {
  const poolId = await poolContract.getPoolId();
  const assetHelpers = new AssetHelpers(WETH_ADDRESS);
  const tokens = assetHelpers.sortTokens(
    [token0.address, token1.address],
    [fp(0.02).mul(initialLiquidityToken0).div(fp(1.0)), fp(0.98).mul(initialLiquidityToken0).div(fp(1.0))]
  );
  const JoinKind = 0;
  const sortedTokens = tokens[0];
  const exactAmountsIn = tokens[1];

  const abi = ['uint256', 'uint256[]'];
  const data = [JoinKind, exactAmountsIn];
  const userDataEncoded = defaultAbiCoder.encode(abi, data);
  const joinPoolRequest: JoinPoolRequest = {
    assets: sortedTokens,
    maxAmountsIn: exactAmountsIn,
    userData: userDataEncoded,
    fromInternalBalance: false,
  };

  logger.info('Approving Vault to transfer HLDR and token1 tokens');
  await token0.connect(provider).approve(vaultContract.address, MAX_UINT256);
  await token1.connect(provider).approve(vaultContract.address, MAX_UINT256);
  logger.info('Seeding initial liquidity for LBP');
  const tx = await vaultContract
    .connect(provider)
    .joinPool(poolId, provider.address, provider.address, joinPoolRequest);
  await tx.wait();
  logger.success('Seeded initial liquidity for SWP-ETH 80-20 SPT pool');
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
