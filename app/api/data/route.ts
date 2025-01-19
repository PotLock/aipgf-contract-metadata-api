import { NextRequest, NextResponse } from "next/server";
import { providers as nearProviders } from "near-api-js";
import { ethers } from "ethers";
import { RpcProvider, Contract, Account, ec, json } from 'starknet';

async function fetchAbiFromNear(account: string) {
    const response = await fetch(
        `https://api.nearblocks.io/v1/account/${account}/contract/parse`
    );
    const data = await response.json();
    return data.contract[0].schema;
}

async function fetchAbiFromEthereum(contractId: string) {
    const response = await fetch(
        `https://api.etherscan.io/api?module=contract&action=getabi&address=${contractId}&apikey=${process.env.ETH_SCAN_API}`
    );
    const data = await response.json();
    return JSON.parse(data.result);
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { args, network, method_name, contract_id, chain } = body;
    try {
        if (chain === "near") {
            const abi = await fetchAbiFromNear(contract_id);
            let provider = new nearProviders.JsonRpcProvider({
                url: `https://rpc.${network}.near.org`,
            });
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const res: any = await provider.query({
                request_type: `call_function`,
                account_id: `${contract_id}`,
                method_name: method_name,
                args_base64: Buffer.from(
                    JSON.stringify(args)
                ).toString("base64"),
                finality: "final",
            });

            const data = JSON.parse(Buffer.from(res.result).toString());

            return NextResponse.json(data, {
                status: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization",
                },
            });
        } else if (chain === "ethereum") {
            const abi = await fetchAbiFromEthereum(contract_id);
            let provider;
            if (network === "mainnet") {
                provider = new ethers.JsonRpcProvider(`https://mainnet.infura.io/v3/${process.env.INFURA_PROJECT_ID}`);
            } else if (network === "testnet") {
                provider = new ethers.JsonRpcProvider(`https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`);
            } else {
                throw new Error("Unsupported network");
            }

            const contract = new ethers.Contract(contract_id, abi, provider);
            const result = await contract[method_name](...args);

            return NextResponse.json(result, {
                status: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Alloyaw-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization",
                },
            });
        } else if (chain === "starknet") {
            const STARKNET_NODE_URL = process.env.STARKNET_NODE_URL;

            const provider = new RpcProvider({ nodeUrl: `${STARKNET_NODE_URL}` });
            const { abi } = await provider.getClassAt(contract_id);
            if (abi === undefined) {
                throw new Error('no abi.');
            }
            const contract = new Contract(abi, contract_id, provider);
            const result = await contract[method_name](...args);

            return NextResponse.json(result, {
                status: 200,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type, Authorization",
                },
            });
        } else {
            throw new Error("Unsupported chain");
        }
    } catch (error: any
    ) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
