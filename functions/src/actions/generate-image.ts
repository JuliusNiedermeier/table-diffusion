import Replicate from "replicate";

const replicateAPIKey = "r8_eugRYy6AAy6w3Nn43L25jahasBSE8LK0G17V5";
const replicate = new Replicate({ auth: replicateAPIKey });

const modelName =
  "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b";

// const imagePrompt =
//   "A beatifully designed wooden table in a modern living room. The focus is on the wooden table. It is made from a dark luxurious looking premium wood.";

export const generateImage = async (prompt: string) => {
  const [imageURL] = (await replicate.run(modelName, {
    input: { prompt },
  })) as [string];

  return imageURL || null;
};

export const downloadImage = async (imageURL: string) => {
  const imageResponse = await fetch(imageURL);
  if (!imageResponse.ok) return null;
  return await imageResponse.arrayBuffer();
};
