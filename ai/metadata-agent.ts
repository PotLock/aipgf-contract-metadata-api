import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function ExtractRustMetadata({ abi, account, methods }: any) {
  const { text } = await generateText({
    model: openai("gpt-4-turbo"),
    system:
      `You are a near smartcontract developer.  ` +
      `When the user gives abi  and method. Provide your response as a JSON object with the following schema: ` +
      ` returns [{ account:${account}, method: ${methods}  , description : description with method 100 words limit , args: [ name: Argument name , type : data types ,description }} ]`,
    prompt: `Your response will not be in Markdown format, only JSON.Here is the abi : ${abi} , method : ${methods}  `,
  });
  return text;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function ExtractSolidityMetadata({ abi, account, methods }: any) {
  const { text } = await generateText({
    model: openai("gpt-4-turbo"),
    system:
      `You are a solidity developer.  ` +
      `When the user gives abi smart contract and method. Provide your response as a JSON object with the following schema: ` +
      ` returns [{ account:${account}, method: ${methods}  , description : description with method 100 words limit , show args if it has args: [ name: Argument name , type : data types ,description }} ]`,
    prompt: `Your response will not be in Markdown format, only JSON.Here is abi : ${abi} , method : ${methods}  `,
  });
  return text;
}

export async function ExtractCairoMetadata({ abi, account, methods, moduleName }: any) {
  const { text } = await generateText({
    model: openai("gpt-4-turbo"),
    system:
      `You are a starknet smartcontract developer.  ` +
      `When the user gives the abi and module name from smartcontract. Provide your response as a JSON object with the following schema: ` +
      ` returns [{ account:${account}::${moduleName}::<function> method: ${methods}  , description : description with method 100 words limit ,  args: [ name: Argument name , type : data types ,description }} ]`,
    prompt: `Your response will not be in Markdown format, only JSON.Here is abi : ${abi} , method : ${methods}  `,
  });
  return text;
}

export async function ExtractMoveMetadata({ abi, packageId, methods, moduleName }: any) {
  const { text } = await generateText({
    model: openai("gpt-4-turbo"),
    system:
      `You are a move smartcontract developer.  ` +
      `When the user gives the abi from smartcontract. Provide your response as a JSON object with the following schema: ` +
      ` returns [{ packageId:${packageId}::${moduleName}::${methods}  , description : description with method 100 words limit ,  args: [ name: Argument name , type : data types ,description }} ]`,
    prompt: `Your response will not be in Markdown format, only JSON.Here is abi : ${abi} , method : ${methods}  `,
  });
  return text;
}