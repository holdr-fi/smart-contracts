import { Contract } from 'ethers';
import { ContractDeployment, NewWeightedPoolParams } from '../../types';
import { ethers, logger, task } from '../../input';
import {
  ONE_MILLION_ETHER,
  ZERO,
  TWENTY_PERCENT,
  EIGHTY_PERCENT,
  ZERO_ADDRESS,
  SWAP_FEE,
  WETH_ADDRESS,
} from '../../constants';
import WeightedPoolABI from '../../../tasks/2022xxxx-solace-swap/abi/WeightedPool.json';
import { getPredeployedInstanceForDuplicate } from '../../utils';
import { AssetHelpers } from '../../utils';

export const deployWeightedPoolNew = async function deployWeightedPoolNew(
  ethToken: Contract,
  rnd0Token: Contract,
  poolFactory: Contract,
  vault: Contract
): Promise<ContractDeployment> {
  const [deployer] = await ethers.getSigners();
  const artifactName = 'WeightedPool';
  const contractName = 'NewWeightedPool';
  const predeployedInstance = await getPredeployedInstanceForDuplicate(contractName, artifactName, task);

  const assetHelpers = new AssetHelpers(WETH_ADDRESS);
  const tokens = assetHelpers.sortTokens([rnd0Token.address, ethToken.address], [EIGHTY_PERCENT, TWENTY_PERCENT]);
  const sortedTokens = tokens[0];
  const sortedWeights = tokens[1];

  const newWeightedPoolParams: NewWeightedPoolParams = {
    name: 'RND0 80 - ETH 20',
    symbol: 'RND080-ETH20',
    tokens: sortedTokens,
    normalizedWeights: sortedWeights,
    rateProviders: [ZERO_ADDRESS, ZERO_ADDRESS],
    swapFeePercentage: SWAP_FEE,
    owner: deployer.address,
  };

  const [protocolFeesCollector, pauseConfiguration] = await Promise.all([
    vault.getProtocolFeesCollector(),
    poolFactory.getPauseConfiguration(),
  ]);

  const constructorArgs = [
    newWeightedPoolParams,
    vault.address,
    protocolFeesCollector,
    pauseConfiguration.pauseWindowDuration,
    pauseConfiguration.bufferPeriodDuration,
  ];

  if (predeployedInstance !== undefined) {
    return {
      name: contractName,
      address: predeployedInstance.address,
      constructorArgs: constructorArgs,
      // If force == true, predeployed = false, otherwise false if !PREDEPLOYED_INSTANCE
      predeployed: true,
      instance: predeployedInstance,
    };
  } else {
    // 1. MINT 1M SWP AND 1M ETH TO DEPLOYER

    const [rnd0Balance, ethBalance] = await Promise.all([
      rnd0Token.balanceOf(deployer.address),
      ethToken.balanceOf(deployer.address),
    ]);
    if (rnd0Balance.eq(ZERO)) {
      logger.info('Minting 1M RND0 to deployer');
      const tx = await rnd0Token.connect(deployer).mint(deployer.address, ONE_MILLION_ETHER);
      await tx.wait();
      logger.success('Minted 1M RND0 to deployer');
    }
    if (ethBalance.eq(ZERO)) {
      logger.info('Minting 1M ETH to deployer');
      const tx = await ethToken.connect(deployer).mint(deployer.address, ONE_MILLION_ETHER);
      await tx.wait();
      logger.success('Minted 1M ETH to deployer');
    }
    // 2. CREATE RND-ETH 80-20 POOL
    logger.info('Creating RND0-ETH 80-20 SPT pool');
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
    logger.success(`Created RND0-ETH 80-20 SPT pool - ${poolAddress}`);
    task.save({ [contractName]: poolAddress });

    return {
      name: contractName,
      address: poolAddress,
      constructorArgs: constructorArgs,
      // If force == true, predeployed = false, otherwise false if !PREDEPLOYED_INSTANCE
      predeployed: false,
      instance: new Contract(poolAddress, WeightedPoolABI, deployer.provider),
    };
  }
};
