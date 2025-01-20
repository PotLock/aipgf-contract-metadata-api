import { NextRequest, NextResponse } from "next/server";
import { RpcProvider } from "starknet";
export const maxDuration = 300;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertEVMToNearABI(input: any, account: string) {
  return {
    schema_version: "0.4.0",
    metadata: {
      name: account,
      version: "0.1.0",
      build: {
        compiler: "solidity",
        builder: "custom-builder",
      },
    },
    body: {
      functions: input
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((item: any) => {
          return {
            name: item.name,
            kind: item.stateMutability == "view" ? "view" : "call",
            params: {
              serialization_type: "json",
              args:
                item.inputs &&
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                item.inputs.map((input: any) => ({
                  name: input.name,
                  type_schema: { type: input.type },
                })),
            },
          };

          return null;
        })
        .filter(Boolean),
    },
  };
}
function convertStarknetToNearABI(starknetAbi: any, account: string): any {
  return {
    schema_version: "0.4.0",
    metadata: {
      name: account,
      version: "0.1.0",
      build: {
        compiler: "cairo",
        builder: "custom-builder",
      },
    },
    body: {
      functions: starknetAbi
        .filter((entry: any) => entry.type === 'function')
        .map((item: any) => ({
          name: item.name,
          kind: item.state_mutability === "view" ? "view" : "call",
          params: {
            serialization_type: "json",
            args: item.inputs && item.inputs.map((input: any) => ({
              name: input.name,
              type_schema: { type: convertType(input.type) },
            })),
          },
        })),
    },
  };
}

function convertType(starknetType: string): string {
  // Add type conversion logic here
  switch (starknetType) {
    case 'core::felt252':
      return 'u128';
    case 'core::integer::u8':
      return 'u8';
    case 'core::integer::u256':
      return 'u256';
    case 'core::integer::u64':
      return 'u64';
    case 'core::bool':
      return 'bool';
    case 'core::starknet::contract_address::ContractAddress':
      return 'string';
    // Add more type conversions as needed
    default:
      return starknetType;
  }
}
export async function GET(req: NextRequest) {
  const account = req.nextUrl.searchParams.get("account") || "";
  const chain = req.nextUrl.searchParams.get("chain") || "";
  const network = req.nextUrl.searchParams.get("network") || "";

  try {
    if (chain.toLowerCase() == "near" && network.toLowerCase() == "mainnet") {
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
    }
    if (chain.toLowerCase() == "ethereum" && network.toLowerCase() == "mainnet") {
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
    }
    if (chain.toLowerCase() == "aptos" && network.toLowerCase() == "mainnet") {
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
    }
    if (chain.toLowerCase() == "starknet" && network.toLowerCase() == "mainnet") {
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
    return NextResponse.json(
      { error: "Unsupported chain or network" },
      { status: 400 }
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}
