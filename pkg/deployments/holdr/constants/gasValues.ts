/**
 * We don't export this in index.ts because of strange error when we attempt to export the following constants:
 *
 * Error HH9: Error while loading Hardhat's configuration.
 * You probably tried to import the "hardhat" module from your config or a file imported from it.
 * This is not possible, as Hardhat can't be initialized while its config is being defined.
 */

export const GWEI = 10 ** 9;
export const MAX_FEE = 0.15 * GWEI;
// export const MAX_PRIORITY_FEE = 1 * GWEI;
