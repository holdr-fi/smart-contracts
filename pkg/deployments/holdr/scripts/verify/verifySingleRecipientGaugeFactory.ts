import { ContractDeployment } from '../../types';
import { task } from '../../input';

export const verifySingleRecipientGaugeFactory = async function verifySingleRecipientGaugeFactory(
  contractDeployment: ContractDeployment,
  tokenMinterAddress: string,
  force = false
): Promise<void> {
  if (force || !contractDeployment.predeployed) {
    await task.verify('SingleRecipientGaugeFactory', contractDeployment.address, contractDeployment.constructorArgs);
    const implementation = await contractDeployment.instance.getGaugeImplementation();
    await task.verify('SingleRecipientGauge', implementation, [tokenMinterAddress]);
    await task.save({ SingleRecipientGauge: implementation });
  }
};
