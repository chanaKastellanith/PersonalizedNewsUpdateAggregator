import { HfInference } from "@huggingface/inference";

const inference = new HfInference("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");

const result = await inference.textClassification({
    model: "cardiffnlp/twitter-roberta-base-sentiment-latest",
    inputs: "Today is a great day",
});

console.log(result);