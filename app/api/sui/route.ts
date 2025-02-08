import { NextRequest, NextResponse } from "next/server";
import { SuiClient } from "@mysten/sui/client";
import { ExtractMoveMetadata, ExtractMoveObjectMetadata } from "@/ai/metadata-agent";

export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const packageId: any = req.nextUrl.searchParams.get("packageId") || "";
  const moduleName = req.nextUrl.searchParams.get("moduleName") || "";
  const methods = req.nextUrl.searchParams.get("methods") || "";
  const network = req.nextUrl.searchParams.get("network") || "";

  try {
    if (network === "mainnet") {
      const response = await fetch(`https://suiscan.xyz/api/sui-backend/mainnet/api/info/sui-object-type?searchStr=${packageId}`);
      const data = await response.json();

      const client = new SuiClient({ url: "https://fullnode.mainnet.sui.io" });

      if (data === "OTHER_OBJECT") {
        const objectData: any = await client.getObject({
          id: packageId,
          options: {
            showType: true,
            showOwner: true,
            showPreviousTransaction: true,
            showDisplay: true,
            showContent: true,
            showBcs: true,
            showStorageRebate: true
          }
        });

        const objectType = objectData.data.type;
        const [innerPackageId, innerModuleName, innerMethods] = objectType.split("::");

        const res = await client.getNormalizedMoveModule({
          package: innerPackageId,
          module: innerModuleName,
        });

        const result = await ExtractMoveObjectMetadata({ objectData: JSON.stringify(objectData), type: objectData.data.type, id : packageId });

        return NextResponse.json(JSON.parse(result), {
          status: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        });
      } else if (data === "PACKAGE") {
        const res = await client.getNormalizedMoveModule({
          package: packageId,
          module: moduleName,
        });

        const result = await ExtractMoveMetadata({ abi: res, packageId, methods, moduleName });

        return NextResponse.json(JSON.parse(result), {
          status: 200,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        });
      } else {
        return NextResponse.json({ error: "Unsupported object type" }, { status: 400 });
      }
    } else {
      throw new Error("Unsupported network");
    }
  } catch (error: any) {
    console.log(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
