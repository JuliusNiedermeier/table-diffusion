import {
  CONTAINER_STATUS_CODE,
  GetContainerRequest,
  GetLinkedInstagramAccountRequest,
  PostPagePhotoMediaRequest,
  PostPublishMediaRequest,
} from "instagram-graph-api";

import { isAxiosError } from "axios";

const facebookGraphAPILongLivedPageAccessToken =
  "EAANBhcxC2zEBOw7BLgcwmJZAaKtf1qXx13C3YpAWdCMQ6JWlP2CnGGOm0ursrzeOzS8YW1qtoLLaCEISu0jKVNlpwZBL8jSq04L3SgMq4X14kVNIVXh8c4VBkAmdlKQkwW55zvSs5nYkpFToX1HyWmOzSrnDgXcvj8ZCw6XHsMhGeKDVZBwE1ar5fPILfJZBSVMGOtiwZD";

// https://developers.facebook.com/docs/instagram-api/getting-started
const facebookPageID = "263335236861161";
// const instagramPageID = "17841465373372558";

const isInstagramContainerPending = (status: CONTAINER_STATUS_CODE | null) => {
  return !status || status === CONTAINER_STATUS_CODE.IN_PROGRESS;
};

const withErrorHandling = async <Result>(callback: () => Result) => {
  try {
    return await callback();
  } catch (error) {
    if (isAxiosError(error)) {
      console.error({ message: error.message, data: error.response?.data });
    } else if (error instanceof Error) {
      console.error(error.name, error.message);
    } else {
      console.error("An unknown error occured");
    }
  }
};

export const getInstagramPageID = () => {
  // https://developers.facebook.com/docs/instagram-api/getting-started
  return withErrorHandling(async () => {
    const response = await new GetLinkedInstagramAccountRequest(
      facebookGraphAPILongLivedPageAccessToken,
      facebookPageID
    ).execute();

    return response.getInstagramPageId();
  });
};

export const createPost = (
  instagramPageID: string,
  imageURL: string,
  caption: string
) => {
  return withErrorHandling(async () => {
    const instagramContainer = await new PostPagePhotoMediaRequest(
      facebookGraphAPILongLivedPageAccessToken,
      instagramPageID,
      imageURL,
      caption
    ).execute();

    return instagramContainer.getId();
  });
};

export const waitForPostToFinish = (postID: string) => {
  return withErrorHandling(async () => {
    let instagramContainerStatus: CONTAINER_STATUS_CODE | null = null;
    let instagramContainerStatusCheckCount = 0;

    while (isInstagramContainerPending(instagramContainerStatus)) {
      if (instagramContainerStatusCheckCount > 10) return false;

      const statusResponse = await new GetContainerRequest(
        facebookGraphAPILongLivedPageAccessToken,
        postID
      ).execute();

      instagramContainerStatus =
        statusResponse.getContainerStatusCode() || null;
      instagramContainerStatusCheckCount++;

      if (isInstagramContainerPending(instagramContainerStatus)) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }
    }

    return true;
  });
};

export const publishPost = (instagramPageID: string, postID: string) => {
  return withErrorHandling(async () => {
    await new PostPublishMediaRequest(
      facebookGraphAPILongLivedPageAccessToken,
      instagramPageID,
      postID
    ).execute();
  });
};
