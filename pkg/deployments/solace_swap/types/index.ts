import { Contract } from 'ethers';

export type ContractDeployment = {
  name: string;
  address: string;
  constructorArgs: any[];
  predeployed: boolean;
  instance?: Contract;
};

export type ContractDeploymentCollection = {
  [name: string]: ContractDeployment;
};
