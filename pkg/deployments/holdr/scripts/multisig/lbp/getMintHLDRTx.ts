import { Contract } from 'ethers';
import { ONE_MILLION_ETHER } from '../../constants';

export const getMintHLDRTx = async function getMintHLDRTx(hldr: Contract, ADMIN_ADDRESS: string) {
  console.log('Mint 2M HLDR to ADMIN_ADDRESS params: ');
  console.log(await hldr.populateTransaction.mint(ADMIN_ADDRESS, ONE_MILLION_ETHER.mul(2)));
};
