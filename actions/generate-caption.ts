import { OpenAI } from "openai";

const openAIAPIKey = "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";
const openai = new OpenAI({ apiKey: openAIAPIKey });

export const generateCaption = async (imageURL: string) => {
  const captionResponse = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    max_tokens: 1000,
    messages: [
      {
        role: "user",
        content: [
          { type: "image_url", image_url: { url: imageURL } },
          {
            type: "text",
            text: "Here is an image of a wooden Table. Please write an instagram caption for this image, for an instagram account that posts images of exceptional wooden tables daily. Do not wrap the caption in quotation marks.",
          },
        ],
      },
    ],
  });

  return captionResponse.choices[0].message.content;
};
