import { PdfReader } from "pdfreader";
import { pdf } from "pdf-to-img";

import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HF_API_KEY);

const pdfPath = process.argv[2];

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
      console.log("Here");
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
  const questionsMap = {
    company_name: "What is the name of the company?",
    location: "Where is the location?",
    website: "Where is the website?",
    email: "Where is the email?",
    desc: "A short summary of what the company does",
    industry: "In which industry does the company operate?",
    founded: "When was the company founded?",
    revenue: "What is the company's annual revenue?",
    employees: "How many employees does the company have?",
    competitors: "Who are the main competitors of the company?",
    key_products:
      "What are the key products or services offered by the company?",
    recent_news: "Any recent news or developments about the company?",
    social_media: "What are the company's social media profiles?",
    partnerships: "Does the company have any notable partnerships?",
    challenges: "What challenges is the company currently facing?",
    future_plans: "What are the company's future plans or strategies?",
  };

  const companyDetails = {};

  for (const key in questionsMap) {
    if (questionsMap.hasOwnProperty(key)) {
      const question = questionsMap[key];
      const result = await hf.questionAnswering({
        model: "deepset/roberta-base-squad2",
        inputs: {
          question,
          context: pdfDetails,
        },
      });
      companyDetails[key] = result && result.answer ? result.answer : null;
    }
  }
  console.log("Extracted details", companyDetails);

  // NEXT STEPS

  // SEARCHING ONLINE ABOUT THIS PARTICULAR DATA ${companyDetails}
  /* 
        https://api.opencorporates.com/documentation/API-Reference
        Using opencorporates API to do further research, Can't do that right now as my IP was banned from using the API 😪
  */

  // GENERATING A VALID REPORT
  /* 
        Using the gathered information to generate a report following a particular template
  */
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
