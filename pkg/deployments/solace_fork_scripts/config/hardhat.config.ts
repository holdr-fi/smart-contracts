import { HardhatUserConfig } from 'hardhat/types';
import { config as dotenv_config } from 'dotenv';
dotenv_config();

export const config: HardhatUserConfig = {
  defaultNetwork: 'rinkeby',
  networks: {
    rinkeby: {
      url: process.env.RINKEBY_URL,
      chainId: 4,
      accounts: JSON.parse(process.env.RINKEBY_ACCOUNTS || '[]'),
    },
  },
  mocha: {
    timeout: 600000,
  },
  solidity: {
    compilers: [
      {
        version: '0.7.0',
      },
    ],
  },
};
