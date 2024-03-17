import sharp from "sharp";
import { log } from "./utils/log";
import { downloadImage, generateImage } from "./actions/generate-image";
import { generateCaption } from "./actions/generate-caption";
import {
  createPost,
  getInstagramPageID,
  publishPost,
  waitForPostToFinish,
} from "./actions/publish";
import { initializeApp, cert } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { createHash } from "crypto";

const app = initializeApp({ credential: cert("./service-account.json") });
const storage = getStorage(app);
const bucket = storage.bucket("table-diffusion.appspot.com");

const post = async () => {
  log(`========== Execution start ${new Date().toUTCString()} ==========`);

  // Image generation ======================================================
  log("Generating image");
  const imageURL = await generateImage();
  if (!imageURL) return log("Image creation failed");
  log(`Image created [${imageURL}]`);

  // Caption generation ====================================================
  log("Generating caption");
  const caption = await generateCaption(imageURL);
  if (!caption) return log("Caption generation failed");
  log(`Caption generated [${caption}]`);

  // Image download ========================================================
  log("Downloading image from replicate");
  const PNGBuffer = await downloadImage(imageURL);
  if (!PNGBuffer) return log("Failed to download image from replicate");
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
    return log("Could not create a signed URL for the uploaded image");
  }

  // Get instagram page ID =================================================
  log("Retrieving Instagram page ID");
  const instagramPageID = await getInstagramPageID();
  if (!instagramPageID) return log("Failed to retrieve Instagram page ID");
  log("Successfully retrieved Instagram page ID");

  // Post creation =========================================================
  log("Creating post");
  const postID = await createPost(instagramPageID, signedImageURL, caption);
  if (!postID) return log("Failed to create post");
  log(`Post created [${postID}]`);

  // Wait for post to be ready for publishing ==============================
  log("Waiting for post to be ready for publishing");
  const finished = await waitForPostToFinish(postID);
  if (!finished) return log("Post creation could not be finished");
  log("Post is now ready for publishing");

  // Post publishing =======================================================
  log("Publishing post");
  await publishPost(instagramPageID, postID);
  log("Post published\n");
};

post();
