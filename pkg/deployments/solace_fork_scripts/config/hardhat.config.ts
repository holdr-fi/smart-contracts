import { HardhatUserConfig } from 'hardhat/types';
import { config as dotenv_config } from 'dotenv';
dotenv_config();

export const config: HardhatUserConfig = {
  defaultNetwork: 'aurora',
  networks: {
    aurora: {
      url: process.env.AURORA_URL,
      chainId: 1313161554,
      accounts: JSON.parse(process.env.RINKEBY_ACCOUNTS || '[]'),
      gas: 12000000,
      blockGasLimit: 0x1fffffffffffff,
    },
    aurora_testnet: {
      url: process.env.AURORA_TESTNET_URL,
      chainId: 1313161555,
      accounts: JSON.parse(process.env.RINKEBY_ACCOUNTS || '[]'),
      gas: 12000000,
      blockGasLimit: 0x1fffffffffffff,
    },
    rinkeby: {
      url: process.env.RINKEBY_URL,
      chainId: 4,
      accounts: JSON.parse(process.env.RINKEBY_ACCOUNTS || '[]'),
      gas: 12000000,
      blockGasLimit: 0x1fffffffffffff,
    },
  },
  mocha: {
    timeout: 600000,
  },
  solidity: {
    compilers: [
      {
        version: '0.7.1',
        settings: {
          optimizer: {
            enabled: true,
            runs: 1500,
          },
        },
      },
    ],
  },
};
