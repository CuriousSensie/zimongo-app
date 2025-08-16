import slowDown from "express-slow-down";

export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 3,            // no delay for first 5 requests
  delayMs:()=> 500,             // add 500ms per request
  maxDelayMs: 3000          // cap delay at 3 seconds max
});
