import logger from '../../src/logger';

export const solidityRequire = function solidityRequire(expression: boolean, errorString: string): void {
  if (!expression) {
    logger.error(errorString);
    throw new Error(errorString);
  }

  return;
};
