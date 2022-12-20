import { MONTH } from '@balancer-labs/v2-helpers/src/time';
import { fp } from '@balancer-labs/v2-helpers/src/numbers';

// GOERLI
// export const ADMIN = '0xC32e0d89e25222ABb4d2d68755baBF5aA6648F15';
// export const WETH_ADDRESS = '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6';
// export const WSTETH_ADDRESS = '0x6320cD32aA674d2898A68ec82e869385Fc5f7E2f';
// export const PAUSE_WINDOW_DURATION = 3 * MONTH;
// export const BUFFER_PERIOD_DURATION = MONTH;
// export const maxYieldValue = fp(0.5);
// export const maxAUMValue = fp(0.5);
// // export const BPT_ADDRESS = '0xf8a0623ab66F985EfFc1C69D05F1af4BaDB01b00';
// export const SWAP_FEE = fp(0.001);
// export const THIRD_STAGE_DELAY = 600;

// MUMBAI
export const ADMIN = '0xC32e0d89e25222ABb4d2d68755baBF5aA6648F15';
// export const WETH_ADDRESS = '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889'; // wMatic on MUMBAI
export const WETH_ADDRESS = '0xC9BdeEd33CD01541e1eeD10f90519d2C06Fe3feB'; // wETH on NEAR
export const WSTETH_ADDRESS = '';
export const PAUSE_WINDOW_DURATION = 3 * MONTH;
export const BUFFER_PERIOD_DURATION = MONTH;
export const maxYieldValue = fp(0.5);
export const maxAUMValue = fp(0.5);
// export const BPT_ADDRESS = '0xf8a0623ab66F985EfFc1C69D05F1af4BaDB01b00';
export const SWAP_FEE = fp(0.001);
export const THIRD_STAGE_DELAY = 600;
export const DESIRED_FEE_STARTTIME = 1671624000; // Dec 21, 2022, 1200 UTC

export const BRIBE_VAULT_FEE = 40000;
export const BRIBE_VAULT_FEE_MAX = 100000;
