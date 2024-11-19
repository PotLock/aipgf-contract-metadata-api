import { NextRequest, NextResponse } from "next/server";

import { ExtractSolidityMetadata } from "@/ai/metadata-agent";

export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const account = req.nextUrl.searchParams.get("account") || "";
  const methods = req.nextUrl.searchParams.get("methods") || "";
  const network = req.nextUrl.searchParams.get("network") || "";

  try {
    if (network == "mainnet") {
      const response = await fetch(
        `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${account}&apikey=${process.env.ETH_SCAN_API}`
      );

      const data = await response.json();
      const source = data.result[0].SourceCode;
      const result = await ExtractSolidityMetadata({
        source,
        account,
        methods,
      });
      return NextResponse.json(JSON.parse(result), { status: 200 });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
