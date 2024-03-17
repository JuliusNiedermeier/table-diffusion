import sharp from "sharp";
import { log } from "./utils/log";
import { downloadImage, generateImage } from "./actions/generate-image";
import { generateCaption } from "./actions/generate-caption";
import { initializeApp, cert, ServiceAccount } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { createHash } from "crypto";
import { generateImagePrompt } from "./actions/generate-image-prompt";
import {
  createPost,
  getInstagramPageID,
  publishPost,
  waitForPostToFinish,
} from "./actions/publish";

import serviceAccount from "./service-account.json";

const app = initializeApp({
  credential: cert(serviceAccount as ServiceAccount),
});

const storage = getStorage(app);
const bucket = storage.bucket("table-diffusion.appspot.com");

export const post = async (): Promise<boolean> => {
  log(`========== Execution start ${new Date().toUTCString()} ==========`);

  // Image prompt generation ===============================================
  log("Generating image prompt");
  const imagePrompt = await generateImagePrompt();
  if (!imagePrompt) {
    log("Image promt generation failed");
    return false;
  }
  log(`Image promt created [${imagePrompt}]`);

  // Image generation ======================================================
  log("Generating image");
  const imageURL = await generateImage(imagePrompt);
  if (!imageURL) {
    log("Image creation failed");
    return false;
  }
  log(`Image created [${imageURL}]`);

  // Caption generation ====================================================
  log("Generating caption");
  const caption = await generateCaption(imageURL);
  if (!caption) {
    log("Caption generation failed");
    return false;
  }
  log(`Caption generated [${caption}]`);

  // Image download ========================================================
  log("Downloading image from replicate");
  const PNGBuffer = await downloadImage(imageURL);
  if (!PNGBuffer) {
    log("Failed to download image from replicate");
    return false;
  }
  log("Image download from replicate complete");

  // Image processing for Instagram upload =================================
  log("Converting png to JPEG");
  const JPGBuffer = await sharp(PNGBuffer).jpeg().toBuffer();
  log("Image converted to JPEG");

  // Image upload to public location =======================================
  const captionHash = createHash("md5").update(caption).digest("hex");
  const bucketFile = bucket.file(`${captionHash}.jpg`);
  await bucketFile.save(JPGBuffer);
  const [signedImageURL] = await bucketFile.getSignedUrl({
    action: "read",
    expires: Date.now() + 1000 * 60 * 10,
  });
  if (!signedImageURL) {
    log("Could not create a signed URL for the uploaded image");
    return false;
  }

  // Get instagram page ID =================================================
  log("Retrieving Instagram page ID");
  const instagramPageID = await getInstagramPageID();
  if (!instagramPageID) {
    log("Failed to retrieve Instagram page ID");
    return false;
  }
  log("Successfully retrieved Instagram page ID");

  // Post creation =========================================================
  log("Creating post");
  const postID = await createPost(instagramPageID, signedImageURL, caption);
  if (!postID) {
    log("Failed to create post");
    return false;
  }
  log(`Post created [${postID}]`);

  // Wait for post to be ready for publishing ==============================
  log("Waiting for post to be ready for publishing");
  const finished = await waitForPostToFinish(postID);
  if (!finished) {
    log("Post creation could not be finished");
    return false;
  }
  log("Post is now ready for publishing");

  // Post publishing =======================================================
  log("Publishing post");
  await publishPost(instagramPageID, postID);
  log("Post published\n");

  return true;
};
