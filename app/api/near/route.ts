import { NextRequest, NextResponse } from "next/server";
import { providers } from "near-api-js";

import { ExtractRustMetadata } from "@/ai/metadata-agent";

export const maxDuration = 300;

const formatSourceCodePath = (path: string, lang: string) => {
  const segments = path ? path.split("/") : [];

  segments.pop();
  if (lang === "rust") {
    segments.push("src");
  }

  return segments.join("/");
};

export async function GET(req: NextRequest) {
  const account = req.nextUrl.searchParams.get("account") || "";
  const methods = req.nextUrl.searchParams.get("methods") || "";
  const network = req.nextUrl.searchParams.get("network") || "";

  try {
    if (network == "mainnet") {
      const response = await fetch(
        `https://api.nearblocks.io/v1/account/${account}/contract/parse`
      );

      const data: any = await response.json();
      const result = await ExtractRustMetadata({ abi: data.contract[0].schema, account, methods });
      console.log(result);
      return NextResponse.json(JSON.parse(result), {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
