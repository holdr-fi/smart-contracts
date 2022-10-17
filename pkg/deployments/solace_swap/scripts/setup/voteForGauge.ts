// Deposit 100K SPT tokens into VotingEscrow contract, obtain veSPT
import { JoinPoolRequest } from '@balancer-labs/balancer-js';
import { WEEK } from '@balancer-labs/v2-helpers/src/time';
import { AssetHelpers } from '../../utils';
import { BigNumber as BN, Contract } from 'ethers';
import { ZERO, ONE_ETHER, WETH_ADDRESS } from '../../constants';
import { ContractDeploymentCollection } from '../../types';
import { ethers, logger, task } from '../../input';
const { defaultAbiCoder } = ethers.utils;
const { MaxUint256 } = ethers.constants;

export const voteForGauge = async function voteForGauge(
  contractDeploymentCollection: ContractDeploymentCollection
): Promise<void> {
  const [deployer] = await ethers.getSigners();

  // 1. ADD 400K SWP and 100K ETH to SWP-ETH 80-20 POOL
  const weightedPool = contractDeploymentCollection['WeightedPool'].instance;
  const swpToken = contractDeploymentCollection['TestBalancerToken'].instance;
  const ethToken = contractDeploymentCollection['TestBalancerToken2'].instance;
  const vault = contractDeploymentCollection['Vault'].instance;
  const votingEscrow: Contract = contractDeploymentCollection['VotingEscrow'].instance;

  if ((await weightedPool.balanceOf(deployer.address)).eq(ZERO)) {
    const poolId = await weightedPool.getPoolId();
    const assetHelpers = new AssetHelpers(WETH_ADDRESS);
    const tokens = assetHelpers.sortTokens([swpToken.address, ethToken.address])[0];
    // INIT - https://dev.balancer.fi/resources/joins-and-exits/pool-joins
    const JoinKind = 0;

    const exactAmountsIn =
      tokens[0] == swpToken.address
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
    await swpToken.connect(deployer).approve(vault.address, MaxUint256);
    await ethToken.connect(deployer).approve(vault.address, MaxUint256);
    const tx = await vault.connect(deployer).joinPool(poolId, deployer.address, deployer.address, joinPoolRequest);
    await tx.wait();
    logger.success('Seeded initial liquidity for SWP-ETH 80-20 SPT pool');
  }

  // 2. Lock 100K SPT tokens into VotingEscrow for 1 year, obtain veSPT
  if ((await votingEscrow['balanceOf(address)'](deployer.address)).eq(ZERO)) {
    logger.info('Approving votingEscrow to move SPT from deployer');
    await weightedPool.connect(deployer).approve(votingEscrow.address, MaxUint256);
    const startTime = BN.from((await deployer.provider.getBlock('latest')).timestamp);
    const YEAR = BN.from(WEEK).mul(52);
    const unlockTime = startTime.add(YEAR);
    logger.info('Creating lock');
    await votingEscrow.connect(deployer).create_lock(ONE_ETHER.mul(100000), unlockTime);
  }
};
