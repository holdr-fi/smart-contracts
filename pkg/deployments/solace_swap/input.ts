import { config as dotenv_config } from 'dotenv';
import hre from 'hardhat';
import hardhat from 'hardhat';
const { ethers } = hardhat;
import logger, { Logger } from '../src/logger';
import Task, { TaskMode } from '../src/task';
import Verifier from '../src/verifier';

dotenv_config();
// (silent: true, verbose: false)
Logger.setDefaults(false, true);
const verifier = process.env.POLYGONSCAN_API_KEY
  ? new Verifier(hre.network, process.env.POLYGONSCAN_API_KEY)
  : undefined;
const TASK_ID = '2022xxxx-solace-swap';
const task = new Task(TASK_ID, TaskMode.LIVE, hre.network.name, verifier);

const createNewTask = function (createNewTasktaskID: string): Task {
  return new Task(createNewTasktaskID, TaskMode.LIVE, hre.network.name, verifier);
};

export { ethers, task, logger, createNewTask };
