import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function ExtractRustMetadata({ sourceCode, account, methods }: any) {
  const { text } = await generateText({
    model: openai("gpt-4-turbo"),
    system:
      `You are a rust developer.  ` +
      `When the user gives the source code and method. Provide your response as a JSON object with the following schema: ` +
      ` returns [{ account:${account}, method: ${methods}  , description : description with method 100 words limit , args: [ name: Argument name , type : data types ,description }} ]`,
    prompt: `Your response will not be in Markdown format, only JSON.Here is the source code : ${sourceCode} , method : ${methods}  `,
  });
  return text;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function ExtractSolidityMetadata({ sourceCode, account, methods }: any) {
  const { text } = await generateText({
    model: openai("gpt-4-turbo"),
    system:
      `You are a solidity developer.  ` +
      `When the user gives the source code and method. Provide your response as a JSON object with the following schema: ` +
      ` returns [{ account:${account}, method: ${methods}  , description : description with method 100 words limit , show args if it has args: [ name: Argument name , type : data types ,description }} ]`,
    prompt: `Your response will not be in Markdown format, only JSON.Here is the source code : ${sourceCode} , method : ${methods}  `,
  });
  return text;
}
