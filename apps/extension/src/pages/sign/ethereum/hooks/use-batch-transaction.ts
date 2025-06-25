import { useState, useMemo, useCallback } from "react";
import {
  AbiCoder,
  Interface,
  Transaction,
  TransactionLike,
  ZeroAddress,
} from "ethers";

import {
  InternalSendCallsRequest,
  BatchSigningData,
  BatchStrategy,
  DELEGATOR_ADDRESS,
  Call,
  ChainCapabilities,
  AccountUpgradeInfo,
  UnsignedTxLike,
} from "@keplr-wallet/types";
import { EthTransactionType } from "@keplr-wallet/types";
import { ModeLib } from "../utils/mod-lib";

// ABI for the account execution contract used in EIP-7702 atomic batches
const accountExecuteABI = new Interface([
  {
    type: "function",
    name: "execute",
    inputs: [
      {
        name: "_mode",
        type: "bytes32",
        internalType: "ModeCode",
      },
      {
        name: "_executionCalldata",
        type: "bytes",
        internalType: "bytes",
      },
    ],
    outputs: [],
    stateMutability: "payable",
  },
]);

const batchFunctionName = "execute";
const callsSignature = "(address,uint256,bytes)[]";

/**
 * Analysis result for determining the optimal batch processing strategy
 */
export interface BatchStrategyAnalysis {
  /** The strategy that will be used for execution */
  currentStrategy: BatchStrategy;
  /** Whether user needs to choose between different options */
  requiresUserChoice: boolean;
  /** Whether to show upgrade information to the user */
  showUpgradeInfo: boolean;
  /** Whether account upgrade is technically possible */
  canUpgrade: boolean;
  /** Whether upgrade is required for the current strategy */
  isUpgradeRequired: boolean;
  /** Available strategies based on user choice */
  availableStrategies: {
    withUpgrade?: BatchStrategy;
    withoutUpgrade?: BatchStrategy;
  };
  /** Human-readable descriptions for each strategy */
  strategyDescriptions: {
    [key in BatchStrategy]?: string;
  };
  /** Error message if strategy is unavailable */
  error?: string;
}

/**
 * Configuration options for the batch transaction hook
 */
export interface UseBatchTransactionOptions {
  /** The parsed EIP-5792 request containing calls to execute */
  request: InternalSendCallsRequest | null | undefined;
  /** Whether this request comes from internal Keplr operations */
  isInternalRequest: boolean;
  /** Chain ID where transactions will be executed */
  chainId: string;
  /** Account address that will execute the transactions */
  accountAddress: string;
  /** Initial choice for account upgrade (defaults to false) */
  initialUpgradeChoice?: boolean;
}

/**
 * Current state of the batch transaction processing
 */
export interface BatchTransactionState {
  /** Analysis of available strategies and recommendations */
  analysis: BatchStrategyAnalysis;
  /** User's current choice regarding account upgrade */
  upgradeChoice: boolean;
  /** Whether user can change the upgrade choice */
  canChangeUpgrade: boolean;
  /** Prepared transactions ready for signing */
  transactions: Transaction[];
  /** Whether transactions are ready for execution */
  isTransactionReady: boolean;
  /** UI information for rendering user interface */
  uiInfo: {
    isError: boolean;
    errorMessage?: string;
    showUpgradeChoice: boolean;
    upgradeOptions: Array<{
      value: boolean;
      strategy: BatchStrategy;
      label: string;
      description?: string;
      recommended: boolean;
    }>;
    currentStrategyInfo: {
      strategy: BatchStrategy;
      label: string;
      description: string;
      isAtomic: boolean;
      isSequential: boolean;
    };
  };
  /** Prepared signing data ready for signature */
  signingData: BatchSigningData | null;
}

/**
 * Actions available for batch transaction management
 */
export interface BatchTransactionActions {
  /** Update user's upgrade choice */
  setUpgradeChoice: (choice: boolean) => void;
}

/**
 * Advanced React hook for managing EIP-5792 batch transactions
 *
 * This hook handles the complex logic of determining the best execution strategy
 * for multiple Ethereum transactions, considering factors like:
 * - Chain capabilities (atomic batch support)
 * - Account upgrade status (EIP-7702)
 * - Request origin (internal vs external)
 * - User preferences
 *
 * @param options Configuration for batch processing
 * @returns State and actions for batch transaction management
 */
export function useBatchTransaction(
  options: UseBatchTransactionOptions
): BatchTransactionState & BatchTransactionActions {
  const {
    request,
    isInternalRequest,
    chainId,
    accountAddress,
    initialUpgradeChoice = false,
  } = options;

  // User's choice whether to upgrade account for atomic batches
  const [upgradeChoice, setUpgradeChoiceState] = useState(initialUpgradeChoice);

  // Analyze available strategies based on chain capabilities and request type
  const analysis = useMemo(() => {
    if (!request?.calls) {
      return {
        currentStrategy: "unavailable" as BatchStrategy,
        requiresUserChoice: false,
        showUpgradeInfo: false,
        canUpgrade: false,
        isUpgradeRequired: false,
        availableStrategies: {},
        strategyDescriptions: {},
        error: "Invalid request format",
      };
    }

    // Determine initial strategy based on current state
    const initialAnalysis = determineBatchStrategy(
      request.calls,
      request.chainCapabilities,
      upgradeChoice,
      isInternalRequest
    );

    // Recalculate with user's upgrade choice
    return recalculateBatchStrategy(initialAnalysis, upgradeChoice);
  }, [
    request?.calls,
    request?.chainCapabilities,
    upgradeChoice,
    isInternalRequest,
  ]);

  // Generate UI information for rendering user interface
  const uiInfo = useMemo(() => {
    return getBatchStrategyUIInfo(analysis);
  }, [analysis]);

  // Create actual transaction objects based on the selected strategy
  const transactions = useMemo(() => {
    if (!request?.calls || analysis.currentStrategy === "unavailable") {
      return [];
    }

    // Fast path for single transactions (no batching needed)
    if (request.calls.length === 1) {
      return createBatchTransactions(
        request.calls,
        request.nonce,
        "single",
        chainId,
        accountAddress
      );
    }

    // Prepare account upgrade info if required
    const accountUpgradeInfo = analysis.isUpgradeRequired
      ? {
          delegatorAddress: DELEGATOR_ADDRESS,
          initCode: undefined,
        }
      : undefined;

    return createBatchTransactions(
      request.calls,
      request.nonce,
      analysis.currentStrategy,
      chainId,
      accountAddress,
      accountUpgradeInfo
    );
  }, [
    request?.calls,
    request?.nonce,
    analysis.currentStrategy,
    analysis.isUpgradeRequired,
    chainId,
    accountAddress,
  ]);

  // Check if transactions are ready for signing and execution
  const isTransactionReady = useMemo(() => {
    return transactions.length > 0 && !uiInfo.isError;
  }, [transactions.length, uiInfo.isError]);

  // Prepare final signing data that will be sent to the signing process
  const signingData = useMemo(() => {
    if (!request?.batchId || !isTransactionReady) return null;

    return createBatchSigningData(
      analysis.currentStrategy,
      request.batchId,
      transactions
    );
  }, [
    request?.batchId,
    analysis.currentStrategy,
    transactions,
    isTransactionReady,
  ]);

  // Allow user to change upgrade choice if applicable
  const setUpgradeChoice = useCallback(
    (choice: boolean) => {
      if (analysis.requiresUserChoice && analysis.canUpgrade) {
        setUpgradeChoiceState(choice);
      }
    },
    [analysis.requiresUserChoice, analysis.canUpgrade]
  );

  // Whether user can change their upgrade choice
  const canChangeUpgrade = useMemo(() => {
    return analysis.requiresUserChoice && analysis.canUpgrade;
  }, [analysis.requiresUserChoice, analysis.canUpgrade]);

  return {
    analysis,
    upgradeChoice,
    canChangeUpgrade,
    transactions,
    isTransactionReady,
    uiInfo,
    signingData,
    setUpgradeChoice,
  };
}

/**
 * Determines the optimal batch processing strategy based on chain capabilities,
 * request origin, and user preferences.
 *
 * Strategy selection priority:
 * 1. Single transaction: No batching needed
 * 2. Already upgraded account: Atomic batches only
 * 3. External requests: Atomic batches required (with upgrade)
 * 4. Internal requests: User choice between atomic and sequential
 * 5. No atomic support: Sequential only
 *
 * @param calls Array of transactions to execute
 * @param chainCapabilities Chain's atomic batch capabilities
 * @param upgradeAllowed Whether user allows account upgrade
 * @param isInternalRequest Whether request is from internal operations
 * @returns Analysis of available strategies
 */
export function determineBatchStrategy(
  calls: Call[],
  chainCapabilities: ChainCapabilities,
  upgradeAllowed: boolean,
  isInternalRequest: boolean
): BatchStrategyAnalysis {
  // Single transaction doesn't need batching
  if (calls.length === 1) {
    return {
      currentStrategy: "single",
      requiresUserChoice: false,
      showUpgradeInfo: false,
      canUpgrade: false,
      isUpgradeRequired: false,
      availableStrategies: {},
      strategyDescriptions: {
        single: "Single transaction",
      },
    };
  }

  const atomicStatus = chainCapabilities.atomic.status;

  // Account is already upgraded - only atomic batches possible
  if (atomicStatus === "supported") {
    return {
      currentStrategy: "atomic",
      requiresUserChoice: false,
      showUpgradeInfo: false,
      canUpgrade: false,
      isUpgradeRequired: false,
      availableStrategies: {},
      strategyDescriptions: {
        atomic: "All transactions execute together",
      },
    };
  }
  // Account can be upgraded - upgrade required or optional based on request type
  else if (atomicStatus === "ready") {
    // External requests require atomic batches for security
    if (!isInternalRequest) {
      return {
        currentStrategy: "atomic",
        requiresUserChoice: false,
        showUpgradeInfo: true,
        canUpgrade: true,
        isUpgradeRequired: true,
        availableStrategies: {},
        strategyDescriptions: {
          atomic: "Secure batch execution (account upgrade required)",
        },
      };
    }
    // Internal requests can choose between atomic and sequential
    else {
      return {
        currentStrategy: upgradeAllowed ? "atomic" : "sequential",
        requiresUserChoice: true,
        showUpgradeInfo: true,
        canUpgrade: true,
        isUpgradeRequired: upgradeAllowed,
        availableStrategies: {
          withUpgrade: "atomic",
          withoutUpgrade: "sequential",
        },
        strategyDescriptions: {
          atomic: "All succeed or all fail together",
          sequential: "Execute one by one (partial success possible)",
        },
      };
    }
  }
  // Chain doesn't support atomic batches
  else {
    // External requests without atomic support are not allowed
    if (!isInternalRequest) {
      return {
        currentStrategy: "unavailable",
        requiresUserChoice: false,
        showUpgradeInfo: false,
        canUpgrade: false,
        isUpgradeRequired: false,
        availableStrategies: {},
        strategyDescriptions: {
          unavailable: "Batch transactions not supported on this network",
        },
        error:
          "This network doesn't support batch transactions from external apps",
      };
    }

    // Internal requests fall back to sequential execution
    return {
      currentStrategy: "sequential",
      requiresUserChoice: false,
      showUpgradeInfo: false,
      canUpgrade: false,
      isUpgradeRequired: false,
      availableStrategies: {},
      strategyDescriptions: {
        sequential: "Execute transactions one by one",
      },
    };
  }
}

/**
 * Updates the batch strategy based on user's upgrade choice.
 *
 * This function is called when the user changes their preference
 * for account upgrade in the UI.
 *
 * @param analysis Current strategy analysis
 * @param newUpgradeChoice User's new upgrade preference
 * @returns Updated analysis with new strategy
 */
export function recalculateBatchStrategy(
  analysis: BatchStrategyAnalysis,
  newUpgradeChoice: boolean
): BatchStrategyAnalysis {
  // No recalculation needed if user choice is not available
  if (!analysis.requiresUserChoice || !analysis.canUpgrade) {
    return analysis;
  }

  // Select strategy based on user's choice
  const newStrategy = newUpgradeChoice
    ? analysis.availableStrategies.withUpgrade
    : analysis.availableStrategies.withoutUpgrade;

  if (!newStrategy) {
    return analysis;
  }

  return {
    ...analysis,
    currentStrategy: newStrategy,
    isUpgradeRequired: newUpgradeChoice,
  };
}

/**
 * Creates transaction objects based on the selected execution strategy.
 *
 * Different strategies create different transaction structures:
 * - Single: One regular transaction
 * - Atomic: One EIP-7702 transaction with batched calls
 * - Sequential: Multiple regular transactions with incremental nonces
 *
 * @param calls Individual calls to be executed
 * @param nonce Starting nonce for transactions
 * @param strategy Execution strategy to use
 * @param chainId Target chain ID
 * @param accountAddress Account that will execute transactions
 * @param accountUpgradeInfo Upgrade information for EIP-7702
 * @returns Array of prepared transaction objects
 */
export function createBatchTransactions(
  calls: Call[],
  nonce: number,
  strategy: BatchStrategy,
  chainId: string,
  accountAddress: string,
  accountUpgradeInfo?: AccountUpgradeInfo
): Transaction[] {
  switch (strategy) {
    case "single": {
      // Create a single regular transaction
      const txLike: TransactionLike = calls[0];
      const tx = Transaction.from(txLike);
      tx.chainId = chainId.replace("eip155:", "");
      tx.nonce = nonce;
      tx.type = EthTransactionType.eip1559;
      return [tx];
    }

    case "atomic": {
      // Create one transaction that executes all calls atomically
      const atomicTx = createAtomicBatchTransaction(
        calls,
        nonce,
        chainId,
        accountAddress,
        accountUpgradeInfo
      );
      return [atomicTx];
    }

    case "sequential": {
      // Create separate transactions for each call with incremental nonces
      return calls.map((call, index) => {
        const txLike: TransactionLike = call;
        const tx = Transaction.from(txLike);
        tx.chainId = chainId.replace("eip155:", "");
        tx.nonce = nonce + index;
        tx.type = EthTransactionType.eip1559;
        return tx;
      });
    }

    default:
      return [];
  }
}

/**
 * Creates an atomic batch transaction using EIP-7702 account abstraction.
 *
 * This transaction will either execute all calls successfully or revert all changes,
 * providing atomic execution guarantees.
 *
 * @param calls Individual calls to batch together
 * @param nonce Transaction nonce
 * @param chainId Target chain ID
 * @param accountAddress Account address
 * @param accountUpgradeInfo Optional upgrade information for EIP-7702
 * @returns Single transaction that executes all calls atomically
 */
function createAtomicBatchTransaction(
  calls: Call[],
  nonce: number,
  chainId: string,
  accountAddress: string,
  accountUpgradeInfo?: AccountUpgradeInfo
): Transaction {
  // Encode batch execution mode
  const mode = ModeLib.encodeSimpleBatch();
  const abiCoder = new AbiCoder();

  // Encode all calls into a single calldata parameter
  const encodedCalls = abiCoder.encode(
    [callsSignature],
    [calls.map((call) => [call.to ?? ZeroAddress, call.value ?? 0, call.data])]
  );

  // Create the execute function call
  const calldata = accountExecuteABI.encodeFunctionData(batchFunctionName, [
    mode,
    encodedCalls,
  ]);

  // Build the transaction
  const tx = new Transaction();
  tx.to = accountAddress;
  tx.chainId = chainId.replace("eip155:", "");
  tx.nonce = nonce;
  tx.value = 0;
  tx.data = calldata;

  // Add EIP-7702 authorization if account upgrade is needed
  if (accountUpgradeInfo) {
    tx.type = EthTransactionType.eip7702;
    tx.authorizationList = [
      {
        address: accountUpgradeInfo.delegatorAddress,
        nonce: nonce + 1,
        chainId: chainId.replace("eip155:", ""),
        signature: {
          r: "0x00",
          s: "0x00",
          v: 0,
        },
      },
    ];
  } else {
    tx.type = EthTransactionType.eip1559;
  }

  return tx;
}

/**
 * Creates the final signing data structure that will be sent to the signing process.
 *
 * @param strategy Execution strategy being used
 * @param batchId Unique identifier for this batch
 * @param transactions Prepared transaction objects
 * @returns Signing data ready for signature
 */
export function createBatchSigningData(
  strategy: BatchStrategy,
  batchId: string,
  transactions: Transaction[]
): BatchSigningData {
  return {
    strategy,
    batchId,
    unsignedTxs: transactions.map((tx) => {
      const txLike: UnsignedTxLike = tx.toJSON();

      if (tx.type === EthTransactionType.eip7702 && tx.authorizationList) {
        txLike.authorizationList = tx.authorizationList.map((auth) => {
          return {
            address: auth.address,
            nonce: `0x${auth.nonce.toString(16)}`,
            chainId: `0x${auth.chainId.toString(16)}`,
          };
        });
      }
      return txLike;
    }),
  };
}

/**
 * Generates UI information from strategy analysis for rendering user interface.
 *
 * This includes user-friendly labels, descriptions, and options that can be
 * displayed in the signing interface.
 *
 * @param analysis Strategy analysis result
 * @returns UI information for rendering
 */
export function getBatchStrategyUIInfo(analysis: BatchStrategyAnalysis) {
  const {
    currentStrategy,
    requiresUserChoice,
    availableStrategies,
    strategyDescriptions,
    error,
  } = analysis;

  const upgradeOptions = [];

  // Build upgrade options for user choice
  if (requiresUserChoice) {
    // Option to proceed without upgrade
    if (availableStrategies.withoutUpgrade) {
      upgradeOptions.push({
        value: false,
        strategy: availableStrategies.withoutUpgrade,
        label: getStrategyLabel(availableStrategies.withoutUpgrade),
        description: strategyDescriptions[availableStrategies.withoutUpgrade],
        recommended: false,
      });
    }

    // Option to upgrade account (usually recommended)
    if (availableStrategies.withUpgrade) {
      upgradeOptions.push({
        value: true,
        strategy: availableStrategies.withUpgrade,
        label: `${getStrategyLabel(
          availableStrategies.withUpgrade
        )} (Upgrade Account)`,
        description: strategyDescriptions[availableStrategies.withUpgrade],
        recommended: true,
      });
    }
  }

  return {
    isError: currentStrategy === "unavailable",
    errorMessage: error,
    showUpgradeChoice: requiresUserChoice,
    upgradeOptions,
    currentStrategyInfo: {
      strategy: currentStrategy,
      label: getStrategyLabel(currentStrategy),
      description: strategyDescriptions[currentStrategy] || "",
      isAtomic: currentStrategy === "atomic",
      isSequential: currentStrategy === "sequential",
    },
  };
}

/**
 * Converts strategy enum to human-readable label.
 *
 * @param strategy Batch execution strategy
 * @returns User-friendly label
 */
function getStrategyLabel(strategy: BatchStrategy): string {
  switch (strategy) {
    case "single":
      return "Single Transaction";
    case "atomic":
      return "Batch (All or Nothing)";
    case "sequential":
      return "One by One";
    case "unavailable":
      return "Not Available";
    default:
      return "Unknown";
  }
}
