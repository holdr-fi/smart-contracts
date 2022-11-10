// Obtains verified contract source code and metadata for Ethereum mainnet contract from Etherscan
// Attempts to use that info, to verify identical contract on another block explorer

import * as dotenv from 'dotenv';
import { logger } from '../input';
import axios from 'axios';
import build from '../../tasks/2022xxxx-solace-swap/build-info/WeightedPoolFactory.json';

dotenv.config();

export const verifyContractFromMainnet = async function verifyContractFromMainnet(
  mainnetAddress: string,
  otherNetworkAddress: string,
  constructorArgs: string
): Promise<void> {
  // 0x2F2D3048a6c5Bc40a0d2275d9B8818aa73e6E914

  // Get source contract and metadata from Etherscan
  //   const etherscanEndpoint = `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${mainnetAddress}&apikey=${process.env.ETHERSCAN_API_KEY}`;
  //   const etherscanEndpoint = `https://api.aurorascan.dev/api?module=contract&action=getsourcecode&address=${mainnetAddress}&apikey=${process.env.ETHERSCAN_API_KEY}`;
  //   const { data: etherscanResp } = await axios.get(etherscanEndpoint);
  //   const { result: etherscanData } = etherscanResp;

  // Using Etherscan data, attempt verification on AuroraScan
//   const aurorascanEndpoint = 'https://api.aurorascan.dev/api';
  const aurorascanEndpoint = 'https://api-testnet.polygonscan.com/api';
  //   const params = new URLSearchParams();
  //   params.append('apikey', process.env.AURORASCAN_API_KEY || '');
  //   params.append('module', 'contract');
  //   params.append('action', 'verifysourcecode');
  //   params.append('sourceCode', etherscanData[0]?.SourceCode);
  //   params.append('contractAddress', otherNetworkAddress);
  //   params.append('codeformat', 'solidity-single-file');
  //   params.append('contractName', etherscanData[0]?.ContractName);
  //   params.append('compilerversion', etherscanData[0]?.CompilerVersion);
  //   params.append('optimizationUsed', etherscanData[0]?.OptimizationUsed);
  //   params.append('runs', etherscanData[0]?.Runs);
  //   params.append('constructorArguments', constructorArgs);
  //   params.append('licenseType', '5');
  //   const { data: aurorascanResp } = await axios.post(aurorascanEndpoint, params);
  //   const { result: guid } = aurorascanResp;
  //   console.log('Obtained guid: ', guid);

  const params = new URLSearchParams();
  params.append('apikey', process.env.POLYGONSCAN_API_KEY || '');
//   params.append('apikey', process.env.AURORASCAN_API_KEY || '');
  params.append('module', 'contract');
  params.append('action', 'verifysourcecode');
  params.append('contractAddress', otherNetworkAddress);
  params.append('sourceCode', JSON.stringify(build?.input));
  params.append('codeformat', 'solidity-standard-json-input');
  params.append('contractName', 'contracts/WeightedPoolFactory.sol:WeightedPoolFactory');
  params.append('compilerversion', 'v0.7.1+commit.f4a555be');
  params.append('constructorArguments', constructorArgs);
  const { data: aurorascanResp } = await axios.post(aurorascanEndpoint, params);
  const { result: guid } = aurorascanResp;
  console.log('Obtained guid: ', guid);

  await _sleeper(60000);

  const params2 = new URLSearchParams();
  params2.append('apikey', process.env.POLYGONSCAN_API_KEY || '');
  params2.append('guid', guid);
  //   params2.append('guid', 'bi6enmqut2a2thrhpu6gyspwg1yqcdmypw1y8leikmepw8f3r5');
  params2.append('module', 'contract');
  params2.append('action', 'checkverifystatus');
  const { data: auroraScanResp2 } = await axios.get(aurorascanEndpoint, { params: params2 });
  console.log(auroraScanResp2);
};

async function _sleeper(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
