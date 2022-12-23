import { Contract, providers } from 'ethers';
import { ContractDeploymentCollection } from '../../../types';
import { MAX_UINT256 } from '../../../constants';
import ERC20_ABI from '../../../constants/abis/ERC20.json';

// TODO - Also add initial liquidity, and setup gauges for these

export const getVeHLDR = async function getVeHLDR(
  contractDeploymentCollection: ContractDeploymentCollection,
  ADMIN_ADDRESS: string,
  provider: providers.Provider
): Promise<void> {
  const votingEscrow = contractDeploymentCollection['VotingEscrow'].instance;
  const HPT = new Contract('0x190185164382D388ef829a3Ad67998Ab5792EeA3', ERC20_ABI, provider);

  // Approval
  console.log(
    'Give approval for HPT to VotingEscrow: ',
    await HPT.populateTransaction.approve(votingEscrow.address, MAX_UINT256)
  );

  // Deposit HPT
  console.log(HPT.provider);
  const balance = await HPT.balanceOf(ADMIN_ADDRESS);
  console.log(balance.toString());

  console.log('Locking HPT to get veHLDR: ', await votingEscrow.populateTransaction.create_lock(balance, 1687252050));
};
