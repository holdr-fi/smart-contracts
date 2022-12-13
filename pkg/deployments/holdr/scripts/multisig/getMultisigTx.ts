import { ContractDeploymentCollection } from '../../types';
import { getMintHLDRTx } from './getMintHLDRTx';
import { getLBPPoolCreateTx } from './getLBPPoolCreateTx';
import { getLBPPoolActivateTx } from './getLBPPoolActivateTx';
import { getSeedLiquidityTx } from './getSeedLiquidityTx';
import { getWithdrawLiquidityTx } from './getWithdrawLiquidityTx';
import { createInitialPoolsTx } from './createInitialPoolsTx';

export const getMultiSigTx = async function getMultiSigTx(
  contractDeploymentCollection: ContractDeploymentCollection
): Promise<void> {
  // Assuming minting Multisig is the ADMIN
  const ADMIN_ADDRESS = '0x432Eb1f2730662AD1A9791Ed34CB2DBDf7001555';
  const USDC_ADDRESS = '0xB12BFcA5A55806AaF64E99521918A4bf0fC40802';
  const POOL_ADDRESS = '0x051150F2E15E7da28F0a22077de7190295D77D40';
  const hldr = contractDeploymentCollection['HoldrGovernanceToken'].instance;
  const vault = contractDeploymentCollection['Vault'].instance;
  const factory = contractDeploymentCollection['NoProtocolFeeLiquidityBootstrappingPoolFactory'].instance;

  // await getMintHLDRTx(hldr, ADMIN_ADDRESS);
  // await getLBPPoolCreateTx(factory, ADMIN_ADDRESS, hldr.address, USDC_ADDRESS);
  // await getLBPPoolActivateTx(POOL_ADDRESS, hldr.address, USDC_ADDRESS, hldr.provider);
  // await getSeedLiquidityTx(vault, ADMIN_ADDRESS, POOL_ADDRESS, hldr.address, USDC_ADDRESS, hldr.provider);
  // await getWithdrawLiquidityTx(vault, ADMIN_ADDRESS, POOL_ADDRESS, hldr.address, USDC_ADDRESS, hldr.provider);
  await createInitialPoolsTx(contractDeploymentCollection, ADMIN_ADDRESS);
};
