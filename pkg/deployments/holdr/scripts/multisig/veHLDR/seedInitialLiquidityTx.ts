import { AssetHelpers, ZERO } from '../../../utils';
import { Contract, utils, providers, BigNumber } from 'ethers';
import { fp } from '@balancer-labs/v2-helpers/src/numbers';
import { ContractDeploymentCollection, NewWeightedPoolParams, NewStablePoolParams } from '../../../types';
import WEIGHTED_POOL_ABI from '../../../../tasks/2022xxxx-holdr/abi/WeightedPool.json';
import STABLE_POOL_ABI from '../../../../tasks/2022xxxx-holdr/abi/ComposableStablePool.json';
import ERC20_ABI from '../../../constants/abis/ERC20.json';
import { ZERO_ADDRESS, MAX_UINT256 } from '../../../constants';
import { JoinPoolRequest } from '@balancer-labs/balancer-js';
const { defaultAbiCoder } = utils;

// TODO - Also add initial liquidity, and setup gauges for these

export const seedInitialLiquidityTx = async function seedInitialLiquidityTx(
  contractDeploymentCollection: ContractDeploymentCollection,
  ADMIN_ADDRESS: string,
  provider: providers.Provider
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

  const HLDR80_WNEAR20_POOL = '0x190185164382d388ef829a3ad67998ab5792eea3';
  const HLDR50_USDC25_WETH25_POOL = '0x00055c916d93bb1809552430119149af858fbf06';

  const USDC_USDT_STABLEPOOL = '0x480edf7ecb52ef9eace2346b84f29795429aa9c9';
  const USDC40_USDT40_WNEAR20_POOL = '0x89bdd5d6b426c535127819abab51c4c2724d4e03';
  const WNEAR80_WETH20_POOL = '0x9eeebb9184031fbb78a4959ef820d8119d433979';
  const WNEAR80_WBTC20_POOL = '0xdb6b3d53d6f1087eac3f51dd803ccce54f607a6e';
  const WNEAR80_AURORA20_POOL = '0x2524a4d5588d15e10b7495edd548cc53b18db780';
  const AURORA25_BSTN25_PLY25_TRI25_POOL = '0x4ab6f40241f01c9f6dcf8cc154d54b05477551c7';

  const vault = contractDeploymentCollection['Vault'].instance;
  const weightedPoolFactory = contractDeploymentCollection['WeightedPoolFactory'].instance;
  const stablePoolFactory = contractDeploymentCollection['ComposableStablePoolFactory'].instance;
  const assetHelpers = new AssetHelpers(WETH_ADDRESS);

  // 1. HLDR/wNEAR: 80/20 (our governance veHLDR pool)

  // {
  //   const pool = new Contract(HLDR80_WNEAR20_POOL, WEIGHTED_POOL_ABI, provider);
  //   const poolId = await pool.getPoolId();
  //   const assetHelpers = new AssetHelpers(WETH_ADDRESS);
  //   const tokens = assetHelpers.sortTokens(
  //     [HLDR_ADDRESS, WNEAR_ADDRESS],
  //     [BigNumber.from('450403982643504000000'), BigNumber.from('2000000000000000000')]
  //   );
  //   const JoinKind = 0;
  //   const sortedTokens = tokens[0];
  //   const exactAmountsIn = tokens[1];
  //   const abi = ['uint256', 'uint256[]'];
  //   const data = [JoinKind, exactAmountsIn];
  //   const userDataEncoded = defaultAbiCoder.encode(abi, data);
  //   const joinPoolRequest: JoinPoolRequest = {
  //     assets: sortedTokens,
  //     maxAmountsIn: exactAmountsIn,
  //     userData: userDataEncoded,
  //     fromInternalBalance: false,
  //   };
  //   console.log(
  //     'HLDR80_WNEAR20_POOL seed liquidity: ',
  //     await vault.populateTransaction.joinPool(poolId, ADMIN_ADDRESS, ADMIN_ADDRESS, joinPoolRequest)
  //   );
  // }

  // 2. USDC/USDT

  // {
  //   const pool = new Contract(USDC_USDT_STABLEPOOL, STABLE_POOL_ABI, provider);
  //   const poolId = await pool.getPoolId();
  //   const assetHelpers = new AssetHelpers(WETH_ADDRESS);
  //   const tokens = assetHelpers.sortTokens(
  //     [USDC_USDT_STABLEPOOL, USDT_ADDRESS, USDC_ADDRESS],
  //     [BigNumber.from('5192296858534827628530496329000000'), BigNumber.from('1000000'), BigNumber.from('1000000')]
  //   );
  //   const JoinKind = 0;
  //   const sortedTokens = tokens[0];
  //   const exactAmountsIn = tokens[1];
  //   const abi = ['uint256', 'uint256[]'];
  //   const data = [JoinKind, exactAmountsIn];
  //   const userDataEncoded = defaultAbiCoder.encode(abi, data);

  //   const joinPoolRequest: JoinPoolRequest = {
  //     assets: sortedTokens,
  //     maxAmountsIn: exactAmountsIn,
  //     userData: userDataEncoded,
  //     fromInternalBalance: false,
  //   };

  //   console.log(
  //     'USDC_USDT_STABLEPOOL seed liquidity: ',
  //     await vault.populateTransaction.joinPool(poolId, ADMIN_ADDRESS, ADMIN_ADDRESS, joinPoolRequest)
  //   );
  // }

  // 3. USDC/USDT/wNEAR

  // {
  //   const pool = new Contract(USDC40_USDT40_WNEAR20_POOL, WEIGHTED_POOL_ABI, provider);
  //   const poolId = await pool.getPoolId();
  //   const assetHelpers = new AssetHelpers(WETH_ADDRESS);
  //   const tokens = assetHelpers.sortTokens(
  //     [USDC_ADDRESS, USDT_ADDRESS, WNEAR_ADDRESS],
  //     [BigNumber.from('1000000'), BigNumber.from('1000000'), BigNumber.from('380000000000000000')]
  //   );
  //   const JoinKind = 0;
  //   const sortedTokens = tokens[0];
  //   const exactAmountsIn = tokens[1];
  //   const abi = ['uint256', 'uint256[]'];
  //   const data = [JoinKind, exactAmountsIn];
  //   const userDataEncoded = defaultAbiCoder.encode(abi, data);
  //   const joinPoolRequest: JoinPoolRequest = {
  //     assets: sortedTokens,
  //     maxAmountsIn: exactAmountsIn,
  //     userData: userDataEncoded,
  //     fromInternalBalance: false,
  //   };
  //   console.log(
  //     'USDC40_USDT40_WNEAR20_POOL seed liquidity: ',
  //     await vault.populateTransaction.joinPool(poolId, ADMIN_ADDRESS, ADMIN_ADDRESS, joinPoolRequest)
  //   );
  // }

  // 4. wNEAR/ETH

  // {
  //   const pool = new Contract(WNEAR80_WETH20_POOL, WEIGHTED_POOL_ABI, provider);
  //   const poolId = await pool.getPoolId();
  //   const assetHelpers = new AssetHelpers(WETH_ADDRESS);
  //   const tokens = assetHelpers.sortTokens(
  //     [WNEAR_ADDRESS, WETH_ADDRESS],
  //     [BigNumber.from('349466962962963000'), BigNumber.from('100000000000000')]
  //   );
  //   const JoinKind = 0;
  //   const sortedTokens = tokens[0];
  //   const exactAmountsIn = tokens[1];
  //   const abi = ['uint256', 'uint256[]'];
  //   const data = [JoinKind, exactAmountsIn];
  //   const userDataEncoded = defaultAbiCoder.encode(abi, data);
  //   const joinPoolRequest: JoinPoolRequest = {
  //     assets: sortedTokens,
  //     maxAmountsIn: exactAmountsIn,
  //     userData: userDataEncoded,
  //     fromInternalBalance: false,
  //   };
  //   console.log(
  //     'WNEAR80_WETH20_POOL seed liquidity: ',
  //     await vault.populateTransaction.joinPool(poolId, ADMIN_ADDRESS, ADMIN_ADDRESS, joinPoolRequest)
  //   );
  // }

  // 5. wNEAR/wBTC

  // {
  //   const pool = new Contract(WNEAR80_WBTC20_POOL, WEIGHTED_POOL_ABI, provider);
  //   const poolId = await pool.getPoolId();
  //   const assetHelpers = new AssetHelpers(WETH_ADDRESS);
  //   const tokens = assetHelpers.sortTokens(
  //     [WNEAR_ADDRESS, WBTC_ADDRESS],
  //     [BigNumber.from('5023683351818180000'), BigNumber.from('10000')]
  //   );
  //   const JoinKind = 0;
  //   const sortedTokens = tokens[0];
  //   const exactAmountsIn = tokens[1];
  //   const abi = ['uint256', 'uint256[]'];
  //   const data = [JoinKind, exactAmountsIn];
  //   const userDataEncoded = defaultAbiCoder.encode(abi, data);
  //   const joinPoolRequest: JoinPoolRequest = {
  //     assets: sortedTokens,
  //     maxAmountsIn: exactAmountsIn,
  //     userData: userDataEncoded,
  //     fromInternalBalance: false,
  //   };
  //   console.log(
  //     'WNEAR80_WBTC20_POOL seed liquidity: ',
  //     await vault.populateTransaction.joinPool(poolId, ADMIN_ADDRESS, ADMIN_ADDRESS, joinPoolRequest)
  //   );
  // }

  // 6. wNEAR/AURORA

  // {
  //   const pool = new Contract(WNEAR80_AURORA20_POOL, WEIGHTED_POOL_ABI, provider);
  //   const poolId = await pool.getPoolId();
  //   const assetHelpers = new AssetHelpers(WETH_ADDRESS);
  //   const tokens = assetHelpers.sortTokens(
  //     [WNEAR_ADDRESS, AURORA_ADDRESS],
  //     [BigNumber.from('8027666165413530'), BigNumber.from('10000000000000000')]
  //   );
  //   const JoinKind = 0;
  //   const sortedTokens = tokens[0];
  //   const exactAmountsIn = tokens[1];
  //   const abi = ['uint256', 'uint256[]'];
  //   const data = [JoinKind, exactAmountsIn];
  //   const userDataEncoded = defaultAbiCoder.encode(abi, data);
  //   const joinPoolRequest: JoinPoolRequest = {
  //     assets: sortedTokens,
  //     maxAmountsIn: exactAmountsIn,
  //     userData: userDataEncoded,
  //     fromInternalBalance: false,
  //   };
  //   console.log(
  //     'WNEAR80_AURORA20_POOL seed liquidity: ',
  //     await vault.populateTransaction.joinPool(poolId, ADMIN_ADDRESS, ADMIN_ADDRESS, joinPoolRequest)
  //   );
  // }

  // 7. HLDR50-USDC25-WETH25

  {
    const pool = new Contract(HLDR50_USDC25_WETH25_POOL, WEIGHTED_POOL_ABI, provider);
    const poolId = await pool.getPoolId();
    const assetHelpers = new AssetHelpers(WETH_ADDRESS);
    const tokens = assetHelpers.sortTokens(
      [HLDR_ADDRESS, USDC_ADDRESS, WETH_ADDRESS],
      [BigNumber.from('426646917032973000000'), BigNumber.from('5000000'), BigNumber.from('4269854824935950')]
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
    console.log(
      'HLDR50_USDC25_WETH25_POOL seed liquidity: ',
      await vault.populateTransaction.joinPool(poolId, ADMIN_ADDRESS, ADMIN_ADDRESS, joinPoolRequest)
    );
  }

  // 8. AURORA25-BSTN25-PLY25-TRI25

  // {
  //   const pool = new Contract(AURORA25_BSTN25_PLY25_TRI25_POOL, WEIGHTED_POOL_ABI, provider);
  //   const poolId = await pool.getPoolId();
  //   const assetHelpers = new AssetHelpers(WETH_ADDRESS);
  //   const tokens = assetHelpers.sortTokens(
  //     [AURORA_ADDRESS, BSTN_ADDRESS, PLY_ADDRESS, TRI_ADDRESS],
  //     [
  //       BigNumber.from('145192070224719'),
  //       BigNumber.from('83161623973651100'),
  //       BigNumber.from('90000000000000000'),
  //       BigNumber.from('8607346309609980'),
  //     ]
  //   );
  //   const JoinKind = 0;
  //   const sortedTokens = tokens[0];
  //   const exactAmountsIn = tokens[1];
  //   const abi = ['uint256', 'uint256[]'];
  //   const data = [JoinKind, exactAmountsIn];
  //   const userDataEncoded = defaultAbiCoder.encode(abi, data);
  //   const joinPoolRequest: JoinPoolRequest = {
  //     assets: sortedTokens,
  //     maxAmountsIn: exactAmountsIn,
  //     userData: userDataEncoded,
  //     fromInternalBalance: false,
  //   };
  //   console.log(
  //     'AURORA25_BSTN25_PLY25_TRI25_POOL seed liquidity: ',
  //     await vault.populateTransaction.joinPool(poolId, ADMIN_ADDRESS, ADMIN_ADDRESS, joinPoolRequest)
  //   );
  // }
};
