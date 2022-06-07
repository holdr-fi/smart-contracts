import { config as dotenv_config } from 'dotenv';
import ERC20_ABI from '../constants/abis/ERC20.json';
import VAULT_ABI from '../../tasks/2022xxxx-solace-investment-pool/abi/Vault.json';
import INVESTMENT_POOL_ABI from '../../tasks/2022xxxx-solace-investment-pool/abi/InvestmentPool.json';
import { ethers, BigNumber as BN } from 'ethers';
import { JoinPoolRequest } from '@balancer-labs/balancer-js';
import { ONE_HUNDRED_PERCENT, AssetHelpers, ONE_ETHER } from '../utils';

const { defaultAbiCoder } = ethers.utils;
const { MaxUint256 } = ethers.constants;

const WETH_ADDRESS = '0xc778417E063141139Fce010982780140Aa0cD5Ab';
const INVESTMENT_POOL_ADDRESS = '0x8B021079eeD6EEA7a495369f70374272DC1A8311';
const VAULT_ADDRESS = '0x0FFf9f3044244048802B5AB4540e2014d1C0688A';
const USER = '0xC32e0d89e25222ABb4d2d68755baBF5aA6648F15';

const TOKENS: { [token: string]: { address: string; amount: BN } } = {
  ['solace']: {
    address: '0x501acE9c35E60f03A2af4d484f49F9B1EFde9f40',
    amount: ONE_ETHER.mul(20),
  },
  ['frax']: { address: '0x86E5B6485e28E52a0dEEd28Cc10772FeB9c4C400', amount: ONE_ETHER.mul(20) },
  ['weth']: { address: '0xc778417E063141139Fce010982780140Aa0cD5Ab', amount: ONE_ETHER.mul(20) },
  ['dai']: { address: '0xE28bEf39f41c63B66cFD97BFfDB6Defc915B3C88', amount: ONE_ETHER.mul(20) },
};

dotenv_config();
const priv_key = JSON.parse(process.env.RINKEBY_ACCOUNTS || '[]')[0];
const provider = new ethers.providers.JsonRpcProvider(process.env.RINKEBY_URL);
const wallet = new ethers.Wallet(priv_key, provider);
const vault = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, wallet);
const pool = new ethers.Contract(INVESTMENT_POOL_ADDRESS, INVESTMENT_POOL_ABI, wallet);

async function main() {
  console.time('script_run_time');
  await addInitialLiquidity();
}

async function addInitialLiquidity() {
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
  const JoinKindInit = 0;
  const initBalances = [ONE_ETHER.div(20), ONE_ETHER.div(20), ONE_ETHER.div(20), ONE_ETHER.div(20)]; // Must be < maxAmountsIn
  const abi = ['uint256', 'uint256[]'];
  const data = [JoinKindInit, initBalances];
  const userDataEncoded = defaultAbiCoder.encode(abi, data);

  const request: JoinPoolRequest = {
    assets: tokens,
    maxAmountsIn: [ONE_ETHER, ONE_ETHER, ONE_ETHER, ONE_ETHER],
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
  const promises = [];

  for (const token in TOKENS) {
    const { address } = TOKENS[token];
    const token_instance = new ethers.Contract(address, ERC20_ABI, wallet);
    promises.push(
      token_instance.approve(VAULT_ADDRESS, MaxUint256, {
        gasLimit: 100000,
        gasPrice: ethers.utils.parseUnits('5.0', 'gwei'),
      })
    );
  }

  await Promise.all(promises);
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
