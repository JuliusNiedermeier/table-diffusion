import { OpenAI } from "openai";

const openAIAPIKey = "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";
const openai = new OpenAI({ apiKey: openAIAPIKey });

const prompt = `Please generate a promt for the Stable Diffusion XL text-to-image model. I will use the generated image for an instagram account, that features a variaty of different premium tables, each crafted in a unique way. Please be creative when it comes to the setting in which the table is placed. It can be both inside or outside in nature or anything else, as long as it stays realistic. Just make sure the type of table matches the setting.

The overall look and feel of the image should match the style of Architechtural Digest.

The image should be as realistic as possible and look like it was created in a professional photo shoot.

Do not wrap your answer in quotation marks.`;

export const generateImagePrompt = async () => {
  const promptResponse = await openai.chat.completions.create({
    model: "gpt-4",
    max_tokens: 1000,
    messages: [{ role: "user", content: [{ type: "text", text: prompt }] }],
  });

  return promptResponse.choices[0].message.content;
};
