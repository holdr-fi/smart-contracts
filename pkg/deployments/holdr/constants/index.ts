import { BigNumber as BN } from 'ethers';
import { fp } from '@balancer-labs/v2-helpers/src/numbers';

export const ONE_HUNDRED_PERCENT = BN.from('1000000000000000000');
export const ONE_THIRD = ONE_HUNDRED_PERCENT.div(3);
export const ONE_QUARTER = ONE_HUNDRED_PERCENT.div(4);
export const ONE_SIXTH = ONE_HUNDRED_PERCENT.div(6);
export const ONE_ETHER = BN.from('1000000000000000000');
export const ONE_MILLION_ETHER = BN.from(10).pow(18).mul(BN.from(10).pow(6));
export const ONE_HUNDRED_THOUSAND_USDC = BN.from(10).pow(6).mul(BN.from(10).pow(5));
export const TWENTY_PERCENT = fp(0.2);
export const EIGHTY_PERCENT = fp(0.8);
export const ZERO = BN.from('0');
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const ONE_DAY = BN.from('86400');
export const MAX_UINT256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';

export * from './constructorArgs';
