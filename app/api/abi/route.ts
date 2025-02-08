import { NextRequest, NextResponse } from "next/server";
import { RpcProvider } from "starknet";
import { convertEVMToNearABI, convertStarknetToNearABI } from "./abiConverters";
import { SuiClient } from '@mysten/sui/client';
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const account = req.nextUrl.searchParams.get("account") || "";
  const chain = req.nextUrl.searchParams.get("chain") || "";
  const network = req.nextUrl.searchParams.get("network") || "";

  try {
    if (chain.toLowerCase() === "near" && network.toLowerCase() === "mainnet") {
      const response = await fetch(
        `https://api.nearblocks.io/v1/account/${account}/contract/parse`
      );

      const data = await response.json();

      return NextResponse.json(data.contract[0].schema, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    } else if (chain.toLowerCase() === "ethereum" && network.toLowerCase() === "mainnet") {
      const response = await fetch(
        `https://api.etherscan.io/api?module=contract&action=getabi&address=${account}&apikey=${process.env.ETH_SCAN_API}`
      );

      const data = await response.json();
      const res = JSON.parse(data.result);
      const nearABI = convertEVMToNearABI(res, account);
      return NextResponse.json(nearABI, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    } else if (chain.toLowerCase() === "aptos" && network.toLowerCase() === "mainnet") {
      const response = await fetch(
        `https://api.mainnet.aptoslabs.com/v1/accounts/${account}/modules?limit=1000`
      );
      const data = await response.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await data.map((data: any) => data.abi);
      return NextResponse.json(res, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });

    } else if (chain.toLowerCase() == "starknet" && network.toLowerCase() == "mainnet") {
      const STARKNET_NODE_URL = process.env.STARKNET_NODE_URL;
      const provider = new RpcProvider({ nodeUrl: `${STARKNET_NODE_URL}` });
      const { abi } = await provider.getClassAt(account);
      if (abi === undefined) {
        throw new Error('No ABI found.');
      }
      return NextResponse.json(convertStarknetToNearABI(abi, account), {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    else if (chain.toLowerCase() === "sui" && network.toLowerCase() === "mainnet") {
      const client = new SuiClient({ url: "https://fullnode.mainnet.sui.io" });
      const result = await client.getNormalizedMoveModulesByPackage({
        package: account,
      });
      const data = result;
      return NextResponse.json(data, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    } else {
      throw new Error("Unsupported chain or network");
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
