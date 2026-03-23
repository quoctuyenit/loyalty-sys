export const REDEEM_COST = (typeof process !== "undefined" && process.env?.REDEEM_COST)
  ? Number(process.env.REDEEM_COST)
  : 100;
