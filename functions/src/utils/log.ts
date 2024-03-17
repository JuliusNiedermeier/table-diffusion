// import { appendFileSync } from "fs";
import * as logger from "firebase-functions/logger";

export const log = (message: string) => {
  logger.info(message);
  // appendFileSync("logs.txt", `${message}\n`);
};
