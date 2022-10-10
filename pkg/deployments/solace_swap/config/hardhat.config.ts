import { HardhatUserConfig } from 'hardhat/types';
import { config as dotenv_config } from 'dotenv';
dotenv_config();

export const config: HardhatUserConfig = {
  defaultNetwork: 'goerli',
  networks: {
    aurora: {
      url: process.env.AURORA_URL,
      chainId: 1313161554,
      accounts: JSON.parse(process.env.PRIVATE_KEYS || '[]'),
      gas: 12000000,
      blockGasLimit: 0x1fffffffffffff,
    },
    aurora_testnet: {
      url: process.env.AURORA_TESTNET_URL,
      chainId: 1313161555,
      accounts: JSON.parse(process.env.PRIVATE_KEYS || '[]'),
      gas: 12000000,
      blockGasLimit: 0x1fffffffffffff,
    },
    goerli: {
      url: process.env.GOERLI_URL,
      chainId: 5,
      accounts: JSON.parse(process.env.PRIVATE_KEYS || '[]'),
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
