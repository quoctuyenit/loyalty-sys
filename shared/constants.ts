/**
 * Safely fetches the REDEEM_COST value for both Vite (Frontend) and Node.js (Backend) environments.
 */
const getRedeemCost = (): number => {
  try {
    // 1. Vite Environment (Frontend)
    // @ts-ignore
    if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_REDEEM_COST) {
      // @ts-ignore
      return Number(import.meta.env.VITE_REDEEM_COST);
    }
  } catch (e) {
    // Ignore error if import.meta is not supported in Node
  }

  try {
    // 2. Node.js Environment (Backend / Vercel Serverless)
    if (typeof process !== "undefined" && process?.env?.VITE_REDEEM_COST) {
      return Number(process.env.VITE_REDEEM_COST);
    }
  } catch (e) {
    // Ignore if process is not defined in Client browser
  }

  // Fallback default
  return 100;
};

export const REDEEM_COST = getRedeemCost();
