import logger from '../../src/logger';

export const require = function require(expression: boolean, errorString: string): void {
  if (!expression) {
    logger.error(error_string);
    throw new Error(error_string);
  }

  return;
};
