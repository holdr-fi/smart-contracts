import { ContractDeploymentCollection, CreateLBPParams, LBPPoolConstructorParams } from '../../types';
import { task } from '../../input';

export const verifyLBPPool = async function verifyLBPPool(
  contractDeploymentCollection: ContractDeploymentCollection,
  createLBPParams: CreateLBPParams,
  deployerAddress: string,
  poolAddress: string
): Promise<void> {
  const { pauseWindowDuration, bufferPeriodDuration } = await contractDeploymentCollection[
    'NoProtocolFeeLiquidityBootstrappingPoolFactory'
  ].instance.getPauseConfiguration();

  console.log('pauseWindowDuration: ', pauseWindowDuration);
  console.log('bufferPeriodDuration: ', bufferPeriodDuration);

  const constructorArgsAsStruct: LBPPoolConstructorParams = {
    vault: contractDeploymentCollection['Vault'].address,
    name: createLBPParams.name,
    symbol: createLBPParams.symbol,
    tokens: createLBPParams.tokens,
    normalizedWeights: createLBPParams.weights,
    swapFeePercentage: createLBPParams.swapFeePercentage,
    pauseWindowDuration: pauseWindowDuration,
    bufferPeriodDuration: bufferPeriodDuration,
    owner: deployerAddress,
    swapEnabledOnStart: createLBPParams.swapEnabledOnStart,
  };

  let retries = 0;
  while (retries <= 10) {
    await task.verify('NoProtocolFeeLiquidityBootstrappingPool', poolAddress, Object.values(constructorArgsAsStruct));
    retries += 1;
  }
};
