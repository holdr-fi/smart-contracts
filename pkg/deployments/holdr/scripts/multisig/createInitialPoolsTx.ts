import { AssetHelpers } from '../../utils';
import { fp } from '@balancer-labs/v2-helpers/src/numbers';
import { ContractDeploymentCollection, NewWeightedPoolParams, NewStablePoolParams } from '../../types';
import { ZERO_ADDRESS } from '../../constants';

// TODO - Also add initial liquidity, and setup gauges for these

export const createInitialPoolsTx = async function createInitialPoolsTx(
  contractDeploymentCollection: ContractDeploymentCollection,
  ADMIN_ADDRESS: string
): Promise<void> {
  const HLDR_ADDRESS = '0x1aaee8F00D02fcdb10cF1F0caB651dC83318c7AA';
  const WNEAR_ADDRESS = '0xC42C30aC6Cc15faC9bD938618BcaA1a1FaE8501d';
  const USDC_ADDRESS = '0xB12BFcA5A55806AaF64E99521918A4bf0fC40802';
  const USDT_ADDRESS = '0x4988a896b1227218e4a686fde5eabdcabd91571f';
  const AURORA_ADDRESS = '0x8bec47865ade3b172a928df8f990bc7f2a3b9f79';
  const WBTC_ADDRESS = '0xF4eB217Ba2454613b15dBdea6e5f22276410e89e';
  const WETH_ADDRESS = '0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB';

  const weightedPoolFactory = contractDeploymentCollection['WeightedPoolFactory'].instance;
  const stablePoolFactory = contractDeploymentCollection['ComposableStablePoolFactory'].instance;
  const assetHelpers = new AssetHelpers(WETH_ADDRESS);

  // 1. HLDR/wNEAR: 80/20 (our governance veHLDR pool)

  // const hldr_wnear_create_params: NewWeightedPoolParams = {
  //   name: 'Holdr 80 HLDR 20 wNEAR',
  //   symbol: '80HLDR-20wNEAR',
  //   tokens: assetHelpers.sortTokens([HLDR_ADDRESS, WNEAR_ADDRESS], [fp(0.8), fp(0.2)])[0],
  //   normalizedWeights: assetHelpers.sortTokens([HLDR_ADDRESS, WNEAR_ADDRESS], [fp(0.8), fp(0.2)])[1],
  //   rateProviders: [ZERO_ADDRESS, ZERO_ADDRESS],
  //   swapFeePercentage: fp(0.003),
  //   owner: ADMIN_ADDRESS,
  // };

  const hldr_wnear_create_params: NewWeightedPoolParams = {
    name: 'Holdr 80 HLDR 20 wNEAR',
    symbol: '80HLDR-20wNEAR',
    tokens: [HLDR_ADDRESS, WETH_ADDRESS],
    normalizedWeights: ['800000000000000000', '200000000000000000'],
    rateProviders: [ZERO_ADDRESS, ZERO_ADDRESS],
    swapFeePercentage: fp(0.003),
    owner: '0xBA1BA1ba1BA1bA1bA1Ba1BA1ba1BA1bA1ba1ba1B',
  };

  console.log(hldr_wnear_create_params);

  console.log(
    'HLDR80-WNEAR20: ',
    await weightedPoolFactory.populateTransaction.create(...Object.values(hldr_wnear_create_params))
  );

  // // 2. USDC/USDT

  // // Use as example - https://etherscan.io/tx/0xa46ab001ffb9449792d5b959e8c973168a812cbe70fc30ae8f08a14cc9275fd9

  // // Need to wrap Flux or Pythnet Oracle contracts

  // const usdt_usdc_create_params: NewStablePoolParams = {
  //   name: 'Holdr USDT USDC Stable Pool',
  //   symbol: 'USDT-USDC Stable Pool',
  //   tokens: [USDT_ADDRESS, USDC_ADDRESS],
  //   amplificationParameter: 5000,
  //   rateProviders: ['0x8caCbA163be8070760F6DdADA7461a558519A9F1', '0x6D80Dc92E4599ADBaE3E4797EBE79c29d0f4c344'],
  //   tokenRateCacheDurations: [0, 0],
  //   exemptFromYieldProtocolFeeFlags: [false, false],
  //   swapFeePercentage: fp(0.0005),
  //   owner: ADMIN_ADDRESS,
  // };

  // console.log(
  //   'USDT-USDC Stable Pool: ',
  //   await stablePoolFactory.populateTransaction.create(...Object.values(usdt_usdc_create_params))
  // );

  // // 3. USDC/USDT/wNEAR

  // const usdc_usdt_wnear_create_params: NewWeightedPoolParams = {
  //   name: 'Holdr 40 USDC 40 USDT 20 wNEAR',
  //   symbol: '40USDC-40USDT-20wNEAR',
  //   tokens: assetHelpers.sortTokens([USDC_ADDRESS, USDT_ADDRESS, WNEAR_ADDRESS], [fp(0.4), fp(0.4), fp(0.2)])[0],
  //   normalizedWeights: assetHelpers.sortTokens(
  //     [USDC_ADDRESS, USDT_ADDRESS, WNEAR_ADDRESS],
  //     [fp(0.4), fp(0.4), fp(0.2)]
  //   )[1],
  //   rateProviders: [ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS],
  //   swapFeePercentage: fp(0.003),
  //   owner: ADMIN_ADDRESS,
  // };

  // console.log(
  //   '40USDC-40USDT-20wNEAR: ',
  //   await weightedPoolFactory.populateTransaction.create(...Object.values(usdc_usdt_wnear_create_params))
  // );

  // // 4. wNEAR/ETH

  // const wnear_weth_create_params: NewWeightedPoolParams = {
  //   name: 'Holdr 80 wNEAR 20 WETH',
  //   symbol: '80wNEAR-20WETH',
  //   tokens: assetHelpers.sortTokens([WNEAR_ADDRESS, WETH_ADDRESS], [fp(0.8), fp(0.2)])[0],
  //   normalizedWeights: assetHelpers.sortTokens([WNEAR_ADDRESS, WETH_ADDRESS], [fp(0.8), fp(0.2)])[1],
  //   rateProviders: [ZERO_ADDRESS, ZERO_ADDRESS],
  //   swapFeePercentage: fp(0.003),
  //   owner: ADMIN_ADDRESS,
  // };

  // console.log(
  //   '80wNEAR-20WETH: ',
  //   await weightedPoolFactory.populateTransaction.create(...Object.values(wnear_weth_create_params))
  // );

  // // 5. wNEAR/wBTC

  // const wnear_wbtc_create_params: NewWeightedPoolParams = {
  //   name: 'Holdr 80 wNEAR 20 WBTC',
  //   symbol: '80wNEAR-20WBTC',
  //   tokens: assetHelpers.sortTokens([WNEAR_ADDRESS, WBTC_ADDRESS], [fp(0.8), fp(0.2)])[0],
  //   normalizedWeights: assetHelpers.sortTokens([WNEAR_ADDRESS, WBTC_ADDRESS], [fp(0.8), fp(0.2)])[1],
  //   rateProviders: [ZERO_ADDRESS, ZERO_ADDRESS],
  //   swapFeePercentage: fp(0.003),
  //   owner: ADMIN_ADDRESS,
  // };

  // console.log(
  //   '80wNEAR-20WBTC: ',
  //   await weightedPoolFactory.populateTransaction.create(...Object.values(wnear_wbtc_create_params))
  // );

  // // 6. wNEAR/AURORA

  // const wnear_aurora_create_params: NewWeightedPoolParams = {
  //   name: 'Holdr 80 wNEAR 20 AURORA',
  //   symbol: '80wNEAR-20AURORA',
  //   tokens: assetHelpers.sortTokens([WNEAR_ADDRESS, AURORA_ADDRESS], [fp(0.8), fp(0.2)])[0],
  //   normalizedWeights: assetHelpers.sortTokens([WNEAR_ADDRESS, AURORA_ADDRESS], [fp(0.8), fp(0.2)])[1],
  //   rateProviders: [ZERO_ADDRESS, ZERO_ADDRESS],
  //   swapFeePercentage: fp(0.003),
  //   owner: ADMIN_ADDRESS,
  // };

  // console.log(
  //   '80wNEAR-20AURORA: ',
  //   await weightedPoolFactory.populateTransaction.create(...Object.values(wnear_aurora_create_params))
  // );
};

// AURORA/BSTN/PLY/TRI : 25/25/25/25
