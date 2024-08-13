export const starknetERC20ContractABI = [
  {
    members: [
      {
        name: "low",
        offset: 0,
        type: "felt",
      },
      {
        name: "high",
        offset: 1,
        type: "felt",
      },
    ],
    name: "Uint256",
    size: 2,
    type: "struct",
  },
  {
    inputs: [
      {
        name: "name",
        type: "felt",
      },
      {
        name: "symbol",
        type: "felt",
      },
      {
        name: "recipient",
        type: "felt",
      },
    ],
    name: "constructor",
    outputs: [],
    type: "constructor",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        name: "name",
        type: "felt",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        name: "symbol",
        type: "felt",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        name: "totalSupply",
        type: "Uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        name: "decimals",
        type: "felt",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        name: "account",
        type: "felt",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        name: "balance",
        type: "Uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        name: "owner",
        type: "felt",
      },
      {
        name: "spender",
        type: "felt",
      },
    ],
    name: "allowance",
    outputs: [
      {
        name: "remaining",
        type: "Uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        name: "recipient",
        type: "felt",
      },
      {
        name: "amount",
        type: "Uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        name: "success",
        type: "felt",
      },
    ],
    type: "function",
  },
  {
    inputs: [
      {
        name: "sender",
        type: "felt",
      },
      {
        name: "recipient",
        type: "felt",
      },
      {
        name: "amount",
        type: "Uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        name: "success",
        type: "felt",
      },
    ],
    type: "function",
  },
  {
    inputs: [
      {
        name: "spender",
        type: "felt",
      },
      {
        name: "amount",
        type: "Uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        name: "success",
        type: "felt",
      },
    ],
    type: "function",
  },
  {
    inputs: [
      {
        name: "spender",
        type: "felt",
      },
      {
        name: "added_value",
        type: "Uint256",
      },
    ],
    name: "increaseAllowance",
    outputs: [
      {
        name: "success",
        type: "felt",
      },
    ],
    type: "function",
  },
  {
    inputs: [
      {
        name: "spender",
        type: "felt",
      },
      {
        name: "subtracted_value",
        type: "Uint256",
      },
    ],
    name: "decreaseAllowance",
    outputs: [
      {
        name: "success",
        type: "felt",
      },
    ],
    type: "function",
  },
  {
    inputs: [
      {
        name: "recipient",
        type: "felt",
      },
      {
        name: "amount",
        type: "Uint256",
      },
    ],
    name: "mint",
    outputs: [],
    type: "function",
  },
  {
    inputs: [
      {
        name: "user",
        type: "felt",
      },
      {
        name: "amount",
        type: "Uint256",
      },
    ],
    name: "burn",
    outputs: [],
    type: "function",
  },
];
