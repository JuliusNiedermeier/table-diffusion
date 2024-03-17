import { appendFileSync } from "fs";

export const log = (message: string) => {
  appendFileSync("logs.txt", `${message}\n`);
};
