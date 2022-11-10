export const consoleLog = function consoleLog(variableName: string, variable: any): void {
  if (variable !== undefined) {
    console.log(`${variableName}: ${variable}`);
  } else {
    console.log(`${variableName}: undefined`);
  }
};
