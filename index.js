import { PdfReader } from "pdfreader";
import { pdf } from "pdf-to-img";
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HF_API_KEY);
// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });
// const openai = new OpenAIApi(configuration);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const pdfPath = process.argv[2];

const extra_command = process.env.EXTRA_COMMAND;

if (!pdfPath) {
  console.error(
    "Please provide the path to the PDF file. Sample\n\t node index ./synot.pdf\n\tor\n\t node index path/to/file "
  );
  process.exit(1);
}

function startLoadingAnimation() {
  const spinner = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let index = 0;

  return setInterval(() => {
    process.stdout.write(`\r${spinner[index]} `);
    index = (index + 1) % spinner.length;
  }, 100);
}

function stopLoadingAnimation(intervalId) {
  clearInterval(intervalId);
  process.stdout.write("\n\n");
}

// PDF -> IMAGE [For some hugging face models that have visual extraction or image to text]
async function convertPdfToImages(pdfPath) {
  let images = [];
  const doc = await pdf(pdfPath);
  for await (const image of doc) {
    const bufferData = Buffer.from(image, "hex");
    const blob = new Blob([bufferData], { type: "image/png" });
    images.push(blob);
  }
  return images;
}

// PDF -> TEXT
async function convertPdfToTextAndExtractRelevantData(pdfPath) {
  let fileContent = ``;
  const loadingAnimation = startLoadingAnimation();
  new PdfReader().parseFileItems(pdfPath, async (err, item) => {
    if (err) {
      console.error("error:", err);
      return null;
    } else if (!item) {
      await extractCompanyData(fileContent);
      stopLoadingAnimation(loadingAnimation);
    } else if (item.text) {
      fileContent = `${fileContent} ${item.text}`;
    }
  });
}

// Hugging face limit rating affects how much i can work on
async function convertImageToText(image) {}

// RELEVANT DATA EXTRACTION
async function extractCompanyData(pdfDetails) {
  console.log("Analyzing extracted data.");
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a helpful company/industry analyst.",
      },
      {
        role: "user",
        content: `
       ${extra_command}
       ${pdfDetails}`,
      },
    ],
    model: "gpt-3.5-turbo",
  });

  console.log(completion.choices[0]?.message.content);
  return;
}

(async () => {
  try {
    const resp = await convertPdfToTextAndExtractRelevantData(pdfPath);
  } catch (error) {
    console.log(error);
    console.error("Error:", error.message || error);
  }
})();
