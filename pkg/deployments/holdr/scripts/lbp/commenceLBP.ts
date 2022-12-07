import { Contract, BigNumber } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { fp } from '@balancer-labs/v2-helpers/src/numbers';
import LBP_ABI from '../../../tasks/2022xxxx-holdr/abi/NoProtocolFeeLiquidityBootstrappingPool.json';
import { DAY } from '@balancer-labs/v2-helpers/src/time';

export const commenceLBP = async function commenceLBP(
  poolAddress: string,
  provider: SignerWithAddress,
  sortedWeights: BigNumber[]
): Promise<void> {
  const poolInstance = new Contract(poolAddress, LBP_ABI, provider);
  const currentTime = Math.floor(Date.now() / 1000);
  // HOLDR_TODO - Adjust params here
  // Setup 3 DAY LBP, starting in 24 hours.
  // 98/2 => 10/90
  await poolInstance.connect(provider).updateWeightsGradually(
    currentTime + 300,
    currentTime + 300 * 3 + DAY,
    sortedWeights.map((weight) => {
      if (weight.eq(fp(0.02))) {
        return fp(0.9);
      } else {
        return fp(0.1);
      }
    })
  );
};
