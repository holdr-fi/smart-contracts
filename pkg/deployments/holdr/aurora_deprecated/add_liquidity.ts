import { config as dotenv_config } from 'dotenv';
import ERC20_ABI from '../constants/abis/ERC20.json';
import VAULT_ABI from '../../tasks/2022xxxx-investment-pool/abi/Vault.json';
import INVESTMENT_POOL_ABI from '../../tasks/2022xxxx-investment-pool/abi/InvestmentPool.json';
import { ethers, BigNumber as BN } from 'ethers';
import { JoinPoolRequest, SingleSwap, FundManagement } from '@balancer-labs/balancer-js';
import { ONE_HUNDRED_PERCENT, AssetHelpers, ONE_ETHER, ZERO } from '../utils';

const { defaultAbiCoder } = ethers.utils;
const { MaxUint256 } = ethers.constants;

const WETH_ADDRESS = '0x8cacba163be8070760f6ddada7461a558519a9f1';
const INVESTMENT_POOL_ADDRESS = '0x6fF82f9C6E4e64150410c484632746bD0BE30bAC';
const VAULT_ADDRESS = '0x39526464ac81f75009a8c1e425f2340e7f1ddfd4';
const USER = '0xC32e0d89e25222ABb4d2d68755baBF5aA6648F15';

const TOKENS: { [token: string]: { address: string; amount: BN } } = {
  ['usdt']: { address: '0x3D9d7843B3da0E95429BaD2B5165C5B13269F386', amount: ONE_ETHER.mul(100) },
  ['aurora']: {
    address: '0x4cae534FA3bf04eaF17D854f7c6A7D851E277665',
    amount: ONE_ETHER.mul(100),
  },
  ['weth']: { address: '0x8cacba163be8070760f6ddada7461a558519a9f1', amount: ONE_ETHER.mul(100) },
  ['wbtc']: { address: '0x6d80dc92e4599adbae3e4797ebe79c29d0f4c344', amount: ONE_ETHER.mul(100) },
};

dotenv_config();
const priv_key = JSON.parse(process.env.RINKEBY_ACCOUNTS || '[]')[0];
const provider = new ethers.providers.JsonRpcProvider(process.env.AURORA_TESTNET_URL);
// const provider = new ethers.providers.JsonRpcProvider(process.env.RINKEBY_URL);
const wallet = new ethers.Wallet(priv_key, provider);
const vault = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, wallet);
const pool = new ethers.Contract(INVESTMENT_POOL_ADDRESS, INVESTMENT_POOL_ABI, wallet);

async function main() {
  console.time('script_run_time');
  await doTokenApprovals();
  await addInitialLiquidity();
}

// https://dev.balancer.fi/resources/swaps/single-swap
async function swap() {
  const poolId = await pool.getPoolId();

  const singleswap: SingleSwap = {
    poolId: poolId,
    kind: 0, // GIVEN_IN
    assetIn: TOKENS['usdt'].address,
    assetOut: TOKENS['aurora'].address,
    amount: ONE_ETHER.div(40), // Send in 50 FRAX
    userData: '0x',
  };

  const fundManagement: FundManagement = {
    sender: USER,
    fromInternalBalance: false,
    recipient: USER,
    toInternalBalance: false,
  };

  const limit = ZERO; // GIVEN_IN - minimum amount of tokens we would like to receive

  const deadline = 1754688515;

  const tx = await vault.swap(singleswap, fundManagement, limit, deadline, {
    gasLimit: 1000000,
    gasPrice: ethers.utils.parseUnits('5.0', 'gwei'),
  });

  console.log(await tx.wait());
}

async function addLiquidity() {
  // Get poolId
  const poolId = await pool.getPoolId();

  // Get assets
  const assetHelpers = new AssetHelpers(WETH_ADDRESS);

  let tokens = [];
  for (const entry in TOKENS) {
    tokens.push(TOKENS[entry].address);
  }
  [tokens] = assetHelpers.sortTokens(tokens);

  // Get userData - https://dev.balancer.fi/helpers/encoding
  // https://dev.balancer.fi/resources/joins-and-exits/pool-joins
  const JoinKind = 1; // EXACT_TOKENS_IN_FOR_BPT_OUT
  const exactAmountsIn = [ONE_ETHER.div(3), ONE_ETHER.div(3), ONE_ETHER.div(3), ONE_ETHER.div(3)]; // Must be < maxAmountsIn
  const abi = ['uint256', 'uint256[]', 'uint256'];
  const data = [JoinKind, exactAmountsIn, ZERO];
  const userDataEncoded = defaultAbiCoder.encode(abi, data);

  const request: JoinPoolRequest = {
    assets: tokens,
    maxAmountsIn: [ONE_ETHER.mul(100), ONE_ETHER.mul(100), ONE_ETHER.mul(100), ONE_ETHER.mul(100)],
    userData: userDataEncoded,
    fromInternalBalance: false,
  };

  const tx = await vault.joinPool(poolId, USER, USER, request, {
    gasLimit: 1000000,
    gasPrice: ethers.utils.parseUnits('5.0', 'gwei'),
  });

  console.log(await tx.wait());
}

async function addInitialLiquidity() {
  // Get poolId
  const poolId = await pool.getPoolId();

  // Get assets
  const assetHelpers = new AssetHelpers(WETH_ADDRESS);

  let tokens: string[] = [];
  for (const entry in TOKENS) {
    tokens.push(TOKENS[entry].address);
  }
  [tokens] = assetHelpers.sortTokens(tokens);

  // Get userData - https://dev.balancer.fi/helpers/encoding
  const JoinKindInit = 0;
  const initBalances = [ONE_ETHER.mul(100), ONE_ETHER.mul(100), ONE_ETHER.mul(100), ONE_ETHER.mul(100)]; // Must be < maxAmountsIn
  const abi = ['uint256', 'uint256[]'];
  const data = [JoinKindInit, initBalances];
  const userDataEncoded = defaultAbiCoder.encode(abi, data);

  const request: JoinPoolRequest = {
    assets: tokens,
    maxAmountsIn: [ONE_ETHER.mul(200), ONE_ETHER.mul(200), ONE_ETHER.mul(200), ONE_ETHER.mul(200)],
    userData: userDataEncoded,
    fromInternalBalance: false,
  };

  const tx = await vault.joinPool(poolId, USER, USER, request, {
    gasLimit: 1000000,
    gasPrice: ethers.utils.parseUnits('5.0', 'gwei'),
  });

  console.log(tx);
}

async function doTokenApprovals() {
  // const promises: Promise<any>[] = [];

  for (const token in TOKENS) {
    const { address } = TOKENS[token];
    const token_instance = new ethers.Contract(address, ERC20_ABI, wallet);
    // promises.push(
    await token_instance.approve(VAULT_ADDRESS, MaxUint256, {
      gasLimit: 100000,
      gasPrice: ethers.utils.parseUnits('5.0', 'gwei'),
    });
    // );
  }

  // await Promise.all(promises);
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
