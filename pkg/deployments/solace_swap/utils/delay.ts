export const delay = async (ms: number): Promise<any> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
