import { AssetHelpers, ZERO } from '../../../utils';
import { fp } from '@balancer-labs/v2-helpers/src/numbers';
import { ContractDeploymentCollection, NewWeightedPoolParams, NewStablePoolParams } from '../../../types';
import { ZERO_ADDRESS, MAX_UINT256 } from '../../../constants';

// TODO - Also add initial liquidity, and setup gauges for these

export const createInitialPoolsTx = async function createInitialPoolsTx(
  contractDeploymentCollection: ContractDeploymentCollection,
  ADMIN_ADDRESS: string
): Promise<void> {
  const HLDR_ADDRESS = '0x1aaee8F00D02fcdb10cF1F0caB651dC83318c7AA';
  const WNEAR_ADDRESS = '0x6BB0c4d909a84d118B5e6c4b17117e79E621ae94';
  const USDC_ADDRESS = '0xB12BFcA5A55806AaF64E99521918A4bf0fC40802';
  const USDT_ADDRESS = '0x4988a896b1227218e4a686fde5eabdcabd91571f';
  const AURORA_ADDRESS = '0x8bec47865ade3b172a928df8f990bc7f2a3b9f79';
  const WBTC_ADDRESS = '0xF4eB217Ba2454613b15dBdea6e5f22276410e89e';
  const WETH_ADDRESS = '0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB';
  const BSTN_ADDRESS = '0x9f1f933c660a1dc856f0e0fe058435879c5ccef0';
  const PLY_ADDRESS = '0x09c9d464b58d96837f8d8b6f4d9fe4ad408d3a4f';
  const TRI_ADDRESS = '0xFa94348467f64D5A457F75F8bc40495D33c65aBB';
  const AUUSDC_ADDRESS = '0x4f0d864b1ABf4B701799a0b30b57A22dFEB5917b';
  const AUUSDT_ADDRESS = '0xaD5A2437Ff55ed7A8Cad3b797b3eC7c5a19B1c54';
  const HB_A_USDT_POOL = '0x0005b732f5434dbd39cc353d5795e71833820e67';
  const HB_A_USDC_POOL = '0xc51d0a9bcb17a126e1a9f4950b259498abeba1e9';

  const vault = contractDeploymentCollection['Vault'].instance;
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

  // console.log(
  //   'HLDR80-WNEAR20: ',
  //   await weightedPoolFactory.populateTransaction.create(...Object.values(hldr_wnear_create_params))
  // );

  // 2. USDC/USDT

  // Use as example - https://etherscan.io/tx/0xa46ab001ffb9449792d5b959e8c973168a812cbe70fc30ae8f08a14cc9275fd9

  // const stable_pool_create_params: NewStablePoolParams = {
  //   name: 'Holdr Aurigami Boosted Pool (USDC)',
  //   symbol: 'hb-a-USDC',
  //   tokens: [AUUSDC_ADDRESS, USDC_ADDRESS],
  //   amplificationParameter: 200,
  //   rateProviders: ['0x247f8c7379C71d845687A7d9Ec642C3D09782Aa4', '0x6e2f7a0291872380292b40dEaC7F4dcD587daaAB'],
  //   tokenRateCacheDurations: [21600, 21600],
  //   exemptFromYieldProtocolFeeFlags: [false, false],
  //   swapFeePercentage: fp(0.0005),
  //   owner: ADMIN_ADDRESS,
  // };

  // const stable_pool_create_params: NewStablePoolParams = {
  //   name: 'Holdr Aurigami Boosted Pool (USDT)',
  //   symbol: 'hb-a-USDT',
  //   tokens: [USDT_ADDRESS, AUUSDT_ADDRESS],
  //   amplificationParameter: 200,
  //   rateProviders: ['0x723Da95511ebe7320AD22D92fa273A0EAf1993D1', '0x9A1671e139332b7BfADc6E15360FD89da4399b52'],
  //   tokenRateCacheDurations: [21600, 21600],
  //   exemptFromYieldProtocolFeeFlags: [false, false],
  //   swapFeePercentage: fp(0.0005),
  //   owner: ADMIN_ADDRESS,
  // };

  // const stable_pool_create_params: NewStablePoolParams = {
  //   name: 'Holdr Aurigami Boosted StablePool',
  //   symbol: 'hb-a-USD',
  //   tokens: [HB_A_USDT_POOL, HB_A_USDC_POOL],
  //   amplificationParameter: 200,
  //   rateProviders: [HB_A_USDT_POOL, HB_A_USDC_POOL],
  //   tokenRateCacheDurations: [21600, 21600],
  //   exemptFromYieldProtocolFeeFlags: [false, false],
  //   swapFeePercentage: fp(0.0005),
  //   owner: ADMIN_ADDRESS,
  // };

  const stable_pool_create_params: NewStablePoolParams = {
    name: 'Holdr USDT-USDC Stable Pool',
    symbol: 'USDT-USDC Stable Pool',
    tokens: [USDT_ADDRESS, USDC_ADDRESS],
    amplificationParameter: 200,
    rateProviders: ['0x723Da95511ebe7320AD22D92fa273A0EAf1993D1', '0x6e2f7a0291872380292b40dEaC7F4dcD587daaAB'],
    tokenRateCacheDurations: [21600, 21600],
    exemptFromYieldProtocolFeeFlags: [false, false],
    swapFeePercentage: fp(0.0005),
    owner: ADMIN_ADDRESS,
  };

  console.log(
    'Stable Pool: ',
    await stablePoolFactory.populateTransaction.create(...Object.values(stable_pool_create_params))
  );

  // 3. USDC/USDT/wNEAR

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

  // 4. wNEAR/ETH

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

  // 5. wNEAR/wBTC

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

  // 6. wNEAR/AURORA

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

  // 7. HLDR50-USDC25-WETH25

  // const hldr_usdc_weth_create_params: NewWeightedPoolParams = {
  //   name: 'Holdr 50 HLDR 25 USDC 25 WETH',
  //   symbol: '50HLDR-25USDC-25WETH',
  //   tokens: assetHelpers.sortTokens([HLDR_ADDRESS, USDC_ADDRESS, WETH_ADDRESS], [fp(0.5), fp(0.25), fp(0.25)])[0],
  //   normalizedWeights: assetHelpers.sortTokens(
  //     [HLDR_ADDRESS, USDC_ADDRESS, WETH_ADDRESS],
  //     [fp(0.5), fp(0.25), fp(0.25)]
  //   )[1],
  //   rateProviders: [ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS],
  //   swapFeePercentage: fp(0.003),
  //   owner: ADMIN_ADDRESS,
  // };

  // console.log(
  //   '50HLDR-25USDC-25WETH: ',
  //   await weightedPoolFactory.populateTransaction.create(...Object.values(hldr_usdc_weth_create_params))
  // );

  // 8. AURORA25-BSTN25-PLY25-TRI25

  // const aurora_bstn_ply_tri_create_params: NewWeightedPoolParams = {
  //   name: 'Holdr 25 AURORA 25 BTSN 25 PLY 25 TRI',
  //   symbol: '25AURORA-25BSTN-25PLY-25TRI',
  //   tokens: assetHelpers.sortTokens(
  //     [AURORA_ADDRESS, BSTN_ADDRESS, PLY_ADDRESS, TRI_ADDRESS],
  //     [fp(0.25), fp(0.25), fp(0.25), fp(0.25)]
  //   )[0],
  //   normalizedWeights: assetHelpers.sortTokens(
  //     [AURORA_ADDRESS, BSTN_ADDRESS, PLY_ADDRESS, TRI_ADDRESS],
  //     [fp(0.25), fp(0.25), fp(0.25), fp(0.25)]
  //   )[1],
  //   rateProviders: [ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS, ZERO_ADDRESS],
  //   swapFeePercentage: fp(0.003),
  //   owner: ADMIN_ADDRESS,
  // };

  // console.log(
  //   '25AURORA-25BSTN-25PLY-25TRI: ',
  //   await weightedPoolFactory.populateTransaction.create(...Object.values(aurora_bstn_ply_tri_create_params))
  // );
};
