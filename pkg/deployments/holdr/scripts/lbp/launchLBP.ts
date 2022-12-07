// Example Tx - https://etherscan.io/tx/0x9ff77c14e3721a617fe03c3163ddcb1c8688f20cfb351fda227f8c6153a54e58
// https://astraguildventures.medium.com/how-to-participate-in-the-agv-auction-on-copperlaunch-272429af78ae
// https://github.com/balancer-labs/balancer-v2-monorepo/blob/master/pkg/pool-weighted/contracts/lbp/LiquidityBootstrappingPool.sol??

import { ContractDeploymentCollection, CreateLBPParams } from '../../types';
import { ethers, logger, task } from '../../input';
import { Contract } from 'ethers';
import { AssetHelpers, ONE_ETHER, ZERO } from '../../utils';
// HOLDR_TODO - swap out for wNEAR on production
import { WETH_ADDRESS, ONE_MILLION_ETHER } from '../../constants';
import { fp } from '@balancer-labs/v2-helpers/src/numbers';
import LBP_ABI from '../../../tasks/2022xxxx-holdr/abi/NoProtocolFeeLiquidityBootstrappingPool.json';
import { provideInitialLiquidity, commenceLBP, verifyLBPPool } from '.';

export const launchLBP = async function launchLBP(
  contractDeploymentCollection: ContractDeploymentCollection
): Promise<void> {
  const [deployer] = await ethers.getSigners();
  const lbpFactory = contractDeploymentCollection['NoProtocolFeeLiquidityBootstrappingPoolFactory'].instance;
  const hldr = contractDeploymentCollection['HoldrGovernanceToken'].instance;
  // HOLDR_TODO - swap out for wNEAR on production
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

  console.log(await lbpFactory.populateTransaction.create(...Object.values(createLBPParams)));

  // Launch pool
  // const output = task.output({ ensure: false });
  // if (output['NoProtocolFeeLiquidityBootstrappingPool'] === undefined) {
  //   logger.info('Creating LBP pool');
  //   const tx = await lbpFactory.connect(deployer).create(...Object.values(createLBPParams));
  //   const log = await tx.wait();
  //   const poolAddress = log?.events[5].args[0];
  //   task.save({ ['NoProtocolFeeLiquidityBootstrappingPool']: poolAddress });
  //   await verifyLBPPool(contractDeploymentCollection, createLBPParams, deployer.address, poolAddress);
  //   logger.info('Launching LBP');
  //   await commenceLBP(poolAddress, deployer, sortedWeights);
  // }

  // // Mint self 35M HLDR
  // const vault = contractDeploymentCollection['Vault'].instance;

  // if ((await hldr.balanceOf(deployer.address)).eq(ZERO)) {
  //   logger.info('Minting self 35M HLDR tokens');
  //   // HOLDR_TODO - Do we need to change mint number?
  //   await hldr.connect(deployer).mint(deployer.address, ONE_MILLION_ETHER.mul(35));
  // }

  // if ((await token1.balanceOf(deployer.address)).lt(ONE_MILLION_ETHER)) {
  //   logger.info('Minting self 35M ETH tokens');
  //   // HOLDR_TODO - Do we need to change mint number?
  //   await token1.connect(deployer).mint(deployer.address, ONE_MILLION_ETHER.mul(35));
  // }

  // // Launch initial liquidity
  // const poolInstance = new Contract(output['NoProtocolFeeLiquidityBootstrappingPool'], LBP_ABI, deployer);
  // if ((await poolInstance.balanceOf(deployer.address)).eq(ZERO)) {
  //   await provideInitialLiquidity(poolInstance, vault, hldr, token1, ONE_ETHER.mul(100000), deployer);
  // }

  // Let people swap
  // Exit pool
};
