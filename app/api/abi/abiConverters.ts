// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function convertEVMToNearABI(input: any, account: string): any {  return {
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
export function convertStarknetToNearABI(starknetAbi: any, account: string): any {
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