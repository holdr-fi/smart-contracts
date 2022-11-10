import Task, { TaskMode } from '../../src/task';
import logger from '../../src/logger';
import { Contract } from 'ethers';
import fs from 'fs';
import { RawOutput } from '../../src/types';

export class TaskExtension extends Task {
  async getPredeployedInstance(name: string): Promise<Contract | undefined> {
    const output = this.output({ ensure: false });
    if (output[name]) {
      logger.info(`${name} already deployed at ${output[name]}`);
      return this.instanceAt(name, output[name]);
    } else {
      return undefined;
    }
  }

  saveVerifiedContractResult(output: RawOutput): void {
    const taskOutputDir = this._dirAt(this.dir(), 'verified', false);
    if (!fs.existsSync(taskOutputDir)) fs.mkdirSync(taskOutputDir);

    const outputFile = this.mode === TaskMode.LIVE ? `${this.network}.json` : 'test.json';
    const taskOutputFile = this._fileAt(taskOutputDir, outputFile, false);
    const previousOutput = this._read(taskOutputFile);

    const finalOutput = { ...previousOutput, ...this._parseRawOutput(output) };
    this._write(taskOutputFile, finalOutput);
  }
}
