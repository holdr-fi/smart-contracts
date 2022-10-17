import { providers } from 'ethers';

export const getCurrentTimestamp = async function getCurrentTimestamp(provider: providers.Provider): Promise<number> {
  return (await provider.getBlock('latest')).timestamp;
};
