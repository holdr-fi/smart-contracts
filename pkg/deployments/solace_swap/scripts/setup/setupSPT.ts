import { JoinPoolRequest } from '@balancer-labs/balancer-js';
import { Contract } from 'ethers';
import { ContractDeploymentCollection, NewWeightedPoolParams } from '../../types';
import { ethers, logger, task } from './../../input';
import {
  ONE_MILLION_ETHER,
  ZERO,
  TWENTY_PERCENT,
  EIGHTY_PERCENT,
  ZERO_ADDRESS,
  SWAP_FEE,
  WETH_ADDRESS,
  ONE_ETHER,
} from './../../constants';
import WeightedPoolABI from '../../../tasks/2022xxxx-solace-swap/abi/WeightedPool.json';
import { AssetHelpers } from '../../utils';
const { defaultAbiCoder } = ethers.utils;
const { MaxUint256 } = ethers.constants;

export const setupSPT = async function setupSPT(
  contractDeploymentCollection: ContractDeploymentCollection
): Promise<void> {
  const [deployer] = await ethers.getSigners();

  // 1. MINT 1M SWP AND 1M ETH TO DEPLOYER
  const swpToken: Contract = contractDeploymentCollection['TestBalancerToken'].instance;
  const ethToken: Contract = contractDeploymentCollection['TestBalancerToken2'].instance;
  const swpBalance = await swpToken.balanceOf(deployer.address);
  const ethBalance = await ethToken.balanceOf(deployer.address);
  if (swpBalance.eq(ZERO)) {
    logger.info('Minting 1M SWP to deployer');
    const tx = await swpToken.connect(deployer).mint(deployer.address, ONE_MILLION_ETHER);
    await tx.wait();
    logger.success('Minted 1M SWP to deployer');
  }
  if (ethBalance.eq(ZERO)) {
    logger.info('Minting 1M ETH to deployer');
    const tx = await ethToken.connect(deployer).mint(deployer.address, ONE_MILLION_ETHER);
    await tx.wait();
    logger.success('Minted 1M ETH to deployer');
  }

  // 2. CREATE SWP-ETH 80-20 POOL
  {
    const output = task.output({ ensure: false });
    if (!output['SPT']) {
      const poolFactory = contractDeploymentCollection['WeightedPoolFactory'].instance;

      const newWeightedPoolParams: NewWeightedPoolParams = {
        name: 'Solace Swap 80 - ETH 20',
        symbol: 'SPT',
        tokens: [swpToken.address, ethToken.address],
        normalizedWeights: [EIGHTY_PERCENT, TWENTY_PERCENT],
        rateProviders: [ZERO_ADDRESS, ZERO_ADDRESS],
        swapFeePercentage: SWAP_FEE,
        owner: deployer.address,
      };

      logger.info('Creating SWP-ETH 80-20 SPT pool');
      const tx = await poolFactory
        .connect(deployer)
        .create(
          newWeightedPoolParams.name,
          newWeightedPoolParams.symbol,
          newWeightedPoolParams.tokens,
          newWeightedPoolParams.normalizedWeights,
          newWeightedPoolParams.rateProviders,
          newWeightedPoolParams.swapFeePercentage,
          newWeightedPoolParams.owner
        );
      const log = await tx.wait();
      const poolAddress = log?.events[0]?.address;
      logger.success(`Created SWP-ETH 80-20 SPT pool - poolAddress`);
      task.save({ ['SPT']: poolAddress });
    }
  }

  // 3. ADD 400K SWP and 100K ETH to SWP-ETH 80-20 POOL
  const output = task.output({ ensure: false });
  const sptContract = new Contract(output['SPT'], WeightedPoolABI, deployer.provider);
  if ((await sptContract.balanceOf(deployer.address)).eq(ZERO)) {
    const poolId = await sptContract.getPoolId();
    const assetHelpers = new AssetHelpers(WETH_ADDRESS);
    const tokens = assetHelpers.sortTokens([swpToken.address, ethToken.address])[0];
    // INIT - https://dev.balancer.fi/resources/joins-and-exits/pool-joins
    const JoinKind = 0;

    const exactAmountsIn =
      tokens[0] == sptContract.address
        ? [ONE_ETHER.mul(400000), ONE_ETHER.mul(100000)]
        : [ONE_ETHER.mul(100000), ONE_ETHER.mul(400000)];

    const abi = ['uint256', 'uint256[]'];
    const data = [JoinKind, exactAmountsIn];
    const userDataEncoded = defaultAbiCoder.encode(abi, data);

    const joinPoolRequest: JoinPoolRequest = {
      assets: tokens,
      maxAmountsIn: exactAmountsIn,
      userData: userDataEncoded,
      fromInternalBalance: false,
    };

    logger.info('Seeding initial liquidity for SWP-ETH 80-20 SPT pool');
    const vault: Contract = contractDeploymentCollection['Vault'].instance;
    await swpToken.connect(deployer).approve(vault.address, MaxUint256);
    await ethToken.connect(deployer).approve(vault.address, MaxUint256);
    const tx = await vault.connect(deployer).joinPool(poolId, deployer.address, deployer.address, joinPoolRequest);
    await tx.wait();
    logger.success('Seeded initial liquidity for SWP-ETH 80-20 SPT pool');
  }
};
