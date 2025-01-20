import { NextRequest, NextResponse } from "next/server";
import { Provider } from "starknet";
import { ExtractCairoMetadata } from "@/ai/metadata-agent";

export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const account = req.nextUrl.searchParams.get("account") || "";
  const methods = req.nextUrl.searchParams.get("methods") || "";
  const network = req.nextUrl.searchParams.get("network") || "";

  try {
    if (network === "mainnet") {
      const STARKNET_NODE_URL = process.env.STARKNET_NODE_URL;
      const provider = new Provider({ nodeUrl: `${STARKNET_NODE_URL}` });
      const { abi } = await provider.getClassAt(account);

      if (!abi) {
        throw new Error('No ABI found.');
      }

      const result = await ExtractCairoMetadata({
        JSON.stringify(abi),
        account,
        methods,
      });

      return NextResponse.json(JSON.parse(result), {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    } else {
      throw new Error("Unsupported network");
    }
  } catch (error:any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
