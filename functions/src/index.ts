/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onSchedule } from "firebase-functions/v2/scheduler";
import { post } from "./main";
import { log } from "./utils/log";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const generateAndPublishPost = onSchedule(
  "every hour",
  async () => {
    const success = await post();
    if (success) log("Execution failed due to logs above.");
    else log("Execution completed successfully");
  }
);
