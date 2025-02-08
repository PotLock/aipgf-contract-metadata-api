import { NextRequest, NextResponse } from "next/server";

import { ExtractMoveMetadata } from "@/ai/metadata-agent";
import { SuiClient } from "@mysten/sui/client";

export const maxDuration = 300;


export async function GET(req: NextRequest) {
  const packageId = req.nextUrl.searchParams.get("packageId") || "";
  const methods = req.nextUrl.searchParams.get("methods") || "";
  const network = req.nextUrl.searchParams.get("network") || "";
  const moduleName = req.nextUrl.searchParams.get("moduleName") || "";
  const client = new SuiClient({ url: "https://fullnode.mainnet.sui.io" });
  console.log(packageId, moduleName);
  const res = await client.getNormalizedMoveModule({
    package: packageId,
    module: moduleName,
  });
  const data: any = res;
  console.log(data);
  try {

    if (network == "mainnet") {


      const result = await ExtractMoveMetadata({ abi: data, packageId, methods, moduleName });
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
