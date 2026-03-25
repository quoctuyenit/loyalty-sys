export const REDEEM_COST = (typeof process !== "undefined" && process.env?.VITE_REDEEM_COST)
  ? Number(process.env.VITE_REDEEM_COST)
  : 100;
