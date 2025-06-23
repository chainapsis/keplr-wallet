import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { Box } from "../../../../components/box";
import { XAxis, YAxis } from "../../../../components/axis";
import { Body2, Body3, H5 } from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import { FormattedMessage } from "react-intl";
import { useTheme } from "styled-components";
import { Gutter } from "../../../../components/gutter";
import { Transaction } from "ethers";
import { defaultRegistry } from "../../components/eth-tx/registry";
import { EthTxBase } from "../../components/eth-tx/render/tx-base";
import { InternalSendCallsRequest, Call } from "@keplr-wallet/background";
import { BatchStrategyAnalysis } from "../hooks/use-batch-transaction";

interface BatchHeaderProps {
  request: InternalSendCallsRequest;
  currentStrategy: string;
}

export const BatchHeader: FunctionComponent<BatchHeaderProps> = observer(
  ({ request, currentStrategy }) => {
    const theme = useTheme();
    const callCount = request.calls?.length || 0;
    const strategyIcon = "⚡";

    return (
      <Box
        padding="1rem"
        backgroundColor={
          theme.mode === "light"
            ? ColorPalette["blue-50"]
            : ColorPalette["blue-800"]
        }
        borderRadius="0.375rem"
        style={{ marginBottom: "1rem" }}
      >
        <XAxis alignY="center">
          <Box
            width="2rem"
            height="2rem"
            alignX="center"
            alignY="center"
            backgroundColor={
              theme.mode === "light"
                ? ColorPalette["blue-100"]
                : ColorPalette["blue-800"]
            }
            borderRadius="50%"
            style={{ marginRight: "0.75rem" }}
          >
            <Body2
              color={
                theme.mode === "light"
                  ? ColorPalette["blue-600"]
                  : ColorPalette["blue-300"]
              }
            >
              {strategyIcon}
            </Body2>
          </Box>
          <Box style={{ flex: 1 }}>
            <YAxis>
              <H5
                color={
                  theme.mode === "light"
                    ? ColorPalette["blue-700"]
                    : ColorPalette["blue-200"]
                }
              >
                <FormattedMessage
                  id="page.sign.ethereum.eip5792.batch-transaction"
                  defaultMessage="Batch Transaction"
                />
              </H5>
              <Body3
                color={
                  theme.mode === "light"
                    ? ColorPalette["blue-600"]
                    : ColorPalette["blue-300"]
                }
              >
                <FormattedMessage
                  id="page.sign.ethereum.eip5792.calls-strategy"
                  defaultMessage="{count} calls • {strategy}"
                  values={{
                    count: callCount,
                    strategy: currentStrategy,
                  }}
                />
              </Body3>
            </YAxis>
          </Box>
        </XAxis>
      </Box>
    );
  }
);

interface UpgradeChoiceProps {
  analysis: BatchStrategyAnalysis;
  upgradeChoice: boolean;
  setUpgradeChoice: (choice: boolean) => void;
  upgradeOptions: Array<{
    value: boolean;
    strategy: string;
    label: string;
    description?: string;
    recommended: boolean;
  }>;
}

export const UpgradeChoice: FunctionComponent<UpgradeChoiceProps> = observer(
  ({ analysis, upgradeChoice, setUpgradeChoice, upgradeOptions }) => {
    const theme = useTheme();

    if (!analysis.showUpgradeInfo) return null;

    if (analysis.requiresUserChoice) {
      return (
        <Box
          padding="1rem"
          backgroundColor={
            theme.mode === "light"
              ? ColorPalette["orange-50"]
              : ColorPalette["orange-800"]
          }
          borderRadius="0.375rem"
          style={{ marginBottom: "1rem" }}
        >
          <YAxis>
            <H5
              color={
                theme.mode === "light"
                  ? ColorPalette["orange-700"]
                  : ColorPalette["orange-200"]
              }
            >
              <FormattedMessage
                id="page.sign.ethereum.eip5792.choose-execution"
                defaultMessage="Choose execution method"
              />
            </H5>
            <Gutter size="0.75rem" />
            <YAxis>
              {upgradeOptions.map((option) => (
                <UpgradeOption
                  key={option.strategy}
                  option={option}
                  selected={upgradeChoice === option.value}
                  onSelect={() => setUpgradeChoice(option.value)}
                />
              ))}
            </YAxis>
          </YAxis>
        </Box>
      );
    } else {
      return (
        <Box style={{ marginBottom: "1rem" }}>
          <Box style={{ marginBottom: "0.75rem" }}>
            <XAxis alignY="center">
              <Box
                width="2rem"
                height="2rem"
                alignX="center"
                alignY="center"
                backgroundColor={ColorPalette["blue-400"]}
                borderRadius="50%"
                style={{ marginRight: "0.875rem" }}
              >
                <Body2 color={ColorPalette.white} style={{ fontWeight: 600 }}>
                  ⚡
                </Body2>
              </Box>
              <Box style={{ flex: 1 }}>
                <YAxis>
                  <XAxis alignY="center">
                    <H5
                      color={
                        theme.mode === "light"
                          ? ColorPalette["gray-700"]
                          : ColorPalette["gray-100"]
                      }
                    >
                      <FormattedMessage
                        id="page.sign.ethereum.eip5792.atomic-required"
                        defaultMessage="Secure Batch Required"
                      />
                    </H5>
                  </XAxis>
                  <Gutter size="0.5rem" />
                  <Body3
                    color={
                      theme.mode === "light"
                        ? ColorPalette["gray-500"]
                        : ColorPalette["gray-300"]
                    }
                  >
                    {analysis.strategyDescriptions[analysis.currentStrategy]}
                  </Body3>
                </YAxis>
              </Box>
            </XAxis>
          </Box>
        </Box>
      );
    }
  }
);

interface UpgradeOptionProps {
  option: {
    value: boolean;
    strategy: string;
    label: string;
    description?: string;
    recommended: boolean;
  };
  selected: boolean;
  onSelect: () => void;
}

const UpgradeOption: FunctionComponent<UpgradeOptionProps> = observer(
  ({ option, selected, onSelect }) => {
    const theme = useTheme();

    return (
      <Box
        padding="0.875rem"
        backgroundColor={
          selected
            ? theme.mode === "light"
              ? ColorPalette.white
              : ColorPalette["gray-700"]
            : theme.mode === "light"
            ? ColorPalette["gray-50"]
            : ColorPalette["gray-600"]
        }
        borderRadius="0.5rem"
        style={{
          marginBottom: "0.5rem",
          border: selected
            ? `2px solid ${ColorPalette["blue-400"]}`
            : `1px solid ${
                theme.mode === "light"
                  ? ColorPalette["gray-200"]
                  : ColorPalette["gray-500"]
              }`,
          cursor: "pointer",
          transition: "all 0.15s ease",
        }}
        onClick={onSelect}
      >
        <XAxis alignY="center">
          <Box
            width="1.25rem"
            height="1.25rem"
            borderRadius="50%"
            backgroundColor={
              selected ? ColorPalette["blue-400"] : "transparent"
            }
            style={{
              border: selected
                ? `4px solid ${ColorPalette.white}`
                : `2px solid ${
                    theme.mode === "light"
                      ? ColorPalette["gray-300"]
                      : ColorPalette["gray-400"]
                  }`,
              boxSizing: "border-box",
              boxShadow: selected
                ? `0 0 0 2px ${ColorPalette["blue-400"]}`
                : "none",
            }}
          />
          <Gutter direction="horizontal" size="0.875rem" />
          <Box style={{ flex: 1 }}>
            <YAxis>
              <XAxis alignY="center">
                <Body2
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-700"]
                      : ColorPalette["gray-100"]
                  }
                  style={{ fontWeight: 600 }}
                >
                  {option.label}
                </Body2>
                {option.recommended && (
                  <React.Fragment>
                    <Gutter direction="horizontal" size="0.5rem" />
                    <Box
                      padding="0.125rem 0.5rem"
                      backgroundColor={ColorPalette["green-100"]}
                      borderRadius="1rem"
                    >
                      <Body3
                        color={ColorPalette["green-700"]}
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                      >
                        <FormattedMessage
                          id="page.sign.ethereum.eip5792.recommended"
                          defaultMessage="Recommended"
                        />
                      </Body3>
                    </Box>
                  </React.Fragment>
                )}
              </XAxis>
              <Gutter size="0.25rem" />
              <Body3
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-500"]
                    : ColorPalette["gray-300"]
                }
              >
                {option.description}
              </Body3>
            </YAxis>
          </Box>
        </XAxis>
      </Box>
    );
  }
);

interface TransactionListProps {
  transactions: Transaction[];
  chainId: string;
}

export const TransactionList: FunctionComponent<TransactionListProps> =
  observer(({ transactions, chainId }) => {
    if (transactions.length === 0) return null;

    return (
      <YAxis>
        {transactions.map((tx, index) => (
          <TransactionItem
            key={index}
            tx={tx}
            index={index}
            totalCount={transactions.length}
            chainId={chainId}
          />
        ))}
      </YAxis>
    );
  });

interface TransactionItemProps {
  tx: Transaction;
  index: number;
  totalCount: number;
  chainId: string;
}

const TransactionItem: FunctionComponent<TransactionItemProps> = observer(
  ({ tx, index, totalCount, chainId }) => {
    const theme = useTheme();
    const { icon, title, content } = defaultRegistry.render(chainId, tx);

    return (
      <Box
        padding="1rem"
        backgroundColor={
          theme.mode === "light" ? ColorPalette.white : ColorPalette["gray-600"]
        }
        borderRadius="0.5rem"
        style={{
          marginBottom: index < totalCount - 1 ? "0.75rem" : "0",
          border: `1px solid ${
            theme.mode === "light"
              ? ColorPalette["gray-100"]
              : ColorPalette["gray-500"]
          }`,
        }}
      >
        <YAxis>
          <XAxis alignY="center">
            <Body3
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-400"]
                  : ColorPalette["gray-300"]
              }
              style={{ fontWeight: 600 }}
            >
              <FormattedMessage
                id="page.sign.ethereum.eip5792.transaction-number"
                defaultMessage="#{number}"
                values={{ number: index + 1 }}
              />
            </Body3>
            <Box style={{ flex: 1 }} />
            {totalCount > 1 && (
              <Box
                padding="0.25rem 0.5rem"
                backgroundColor={
                  theme.mode === "light"
                    ? ColorPalette["gray-100"]
                    : ColorPalette["gray-700"]
                }
                borderRadius="0.25rem"
              >
                <Body3
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-600"]
                      : ColorPalette["gray-300"]
                  }
                  style={{ fontSize: "0.75rem" }}
                >
                  {index + 1}/{totalCount}
                </Body3>
              </Box>
            )}
          </XAxis>
          <Gutter size="0.75rem" />

          {icon !== undefined && title !== undefined ? (
            <EthTxBase icon={icon} title={title} content={content} />
          ) : (
            <YAxis>
              <Body2
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-600"]
                    : ColorPalette["gray-200"]
                }
                style={{ fontWeight: 600 }}
              >
                <FormattedMessage
                  id="page.sign.ethereum.eip5792.contract-interaction"
                  defaultMessage="Contract Call"
                />
              </Body2>
              <Gutter size="0.5rem" />
              <Body3
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-500"]
                    : ColorPalette["gray-400"]
                }
                style={{ wordBreak: "break-all" }}
              >
                To: {tx.to}
              </Body3>
              {tx.value && BigInt(tx.value) > BigInt(0) ? (
                <Body3
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-500"]
                      : ColorPalette["gray-400"]
                  }
                >
                  Value: {BigInt(tx.value).toString()} ETH
                </Body3>
              ) : (
                <Body3
                  color={
                    theme.mode === "light"
                      ? ColorPalette["gray-500"]
                      : ColorPalette["gray-400"]
                  }
                >
                  Value: 0 ETH
                </Body3>
              )}
              <Body3
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-500"]
                    : ColorPalette["gray-400"]
                }
                style={{ wordBreak: "break-all" }}
              >
                Data: {tx.data?.slice(0, 42)}...
              </Body3>
            </YAxis>
          )}
        </YAxis>
      </Box>
    );
  }
);

interface RawCallsListProps {
  calls: Call[];
  chainId: string;
}

export const RawCallsList: FunctionComponent<RawCallsListProps> = observer(
  ({ calls, chainId }) => {
    const theme = useTheme();

    if (calls.length === 0) return null;

    return (
      <Box style={{ marginTop: "1rem" }}>
        <Box style={{ marginBottom: "0.75rem" }}>
          <H5
            color={
              theme.mode === "light"
                ? ColorPalette["gray-700"]
                : ColorPalette["gray-100"]
            }
          >
            <FormattedMessage
              id="page.sign.ethereum.eip5792.included-calls"
              defaultMessage="Included Calls"
            />
          </H5>
          <Gutter size="0.25rem" />
          <Body3
            color={
              theme.mode === "light"
                ? ColorPalette["gray-500"]
                : ColorPalette["gray-300"]
            }
          >
            <FormattedMessage
              id="page.sign.ethereum.eip5792.atomic-batch-description"
              defaultMessage="These calls will be executed together atomically"
            />
          </Body3>
        </Box>

        <YAxis>
          {calls.map((call, index) => (
            <RawCallItem
              key={index}
              call={call}
              index={index}
              totalCount={calls.length}
              chainId={chainId}
            />
          ))}
        </YAxis>
      </Box>
    );
  }
);

interface RawCallItemProps {
  call: Call;
  index: number;
  totalCount: number;
  chainId: string;
}

const RawCallItem: FunctionComponent<RawCallItemProps> = observer(
  ({ call, index, totalCount, chainId }) => {
    const theme = useTheme();

    // Try to render using the existing registry
    let renderedCall = null;
    try {
      const tempTx = {
        to: call.to,
        value: call.value || "0x0",
        data: call.data || "0x",
      };
      const { icon, title, content } = defaultRegistry.render(
        chainId,
        tempTx as any
      );
      if (icon !== undefined && title !== undefined) {
        renderedCall = { icon, title, content };
      }
    } catch (error) {
      // Fallback to raw display
    }

    return (
      <Box
        padding="0.875rem"
        backgroundColor={
          theme.mode === "light"
            ? ColorPalette["gray-50"]
            : ColorPalette["gray-700"]
        }
        borderRadius="0.375rem"
        style={{
          marginBottom: index < totalCount - 1 ? "0.5rem" : "0",
          border: `1px solid ${
            theme.mode === "light"
              ? ColorPalette["gray-200"]
              : ColorPalette["gray-600"]
          }`,
        }}
      >
        <YAxis>
          <XAxis alignY="center">
            <Box
              padding="0.125rem 0.375rem"
              backgroundColor={
                theme.mode === "light"
                  ? ColorPalette["blue-100"]
                  : ColorPalette["blue-800"]
              }
              borderRadius="0.25rem"
              style={{ marginRight: "0.5rem" }}
            >
              <Body3
                color={
                  theme.mode === "light"
                    ? ColorPalette["blue-700"]
                    : ColorPalette["blue-200"]
                }
                style={{ fontSize: "0.75rem", fontWeight: 600 }}
              >
                {index + 1}
              </Body3>
            </Box>
            <Body3
              color={
                theme.mode === "light"
                  ? ColorPalette["gray-600"]
                  : ColorPalette["gray-200"]
              }
              style={{ fontWeight: 600 }}
            >
              <FormattedMessage
                id="page.sign.ethereum.eip5792.call-item"
                defaultMessage="Call"
              />
            </Body3>
          </XAxis>

          <Gutter size="0.5rem" />

          {renderedCall ? (
            <EthTxBase
              icon={renderedCall.icon}
              title={renderedCall.title}
              content={renderedCall.content}
            />
          ) : (
            <YAxis>
              <Body3
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-500"]
                    : ColorPalette["gray-400"]
                }
                style={{ wordBreak: "break-all", fontSize: "0.875rem" }}
              >
                <strong>To:</strong> {call.to || "0x0"}
              </Body3>

              <Gutter size="0.25rem" />

              <Body3
                color={
                  theme.mode === "light"
                    ? ColorPalette["gray-500"]
                    : ColorPalette["gray-400"]
                }
                style={{ fontSize: "0.875rem" }}
              >
                <strong>Value:</strong>{" "}
                {call.value ? `${BigInt(call.value).toString()} ETH` : "0 ETH"}
              </Body3>

              {call.data && call.data !== "0x" && (
                <React.Fragment>
                  <Gutter size="0.25rem" />
                  <Body3
                    color={
                      theme.mode === "light"
                        ? ColorPalette["gray-500"]
                        : ColorPalette["gray-400"]
                    }
                    style={{ wordBreak: "break-all", fontSize: "0.875rem" }}
                  >
                    <strong>Data:</strong> {call.data.slice(0, 42)}...
                  </Body3>
                </React.Fragment>
              )}
            </YAxis>
          )}
        </YAxis>
      </Box>
    );
  }
);

interface BatchTransactionInfoProps {
  request: InternalSendCallsRequest | null;
  analysis: BatchStrategyAnalysis;
  transactions: Transaction[];
  chainId: string;
  upgradeChoice: boolean;
  setUpgradeChoice: (choice: boolean) => void;
  upgradeOptions: Array<{
    value: boolean;
    strategy: string;
    label: string;
    description?: string;
    recommended: boolean;
  }>;
  isTransactionReady: boolean;
}

export const BatchTransactionInfo: FunctionComponent<BatchTransactionInfoProps> =
  observer(
    ({
      request,
      analysis,
      transactions,
      chainId,
      upgradeChoice,
      setUpgradeChoice,
      upgradeOptions,
      isTransactionReady,
    }) => {
      const theme = useTheme();

      if (!request) {
        return (
          <Box
            padding="1rem"
            backgroundColor={
              theme.mode === "light"
                ? ColorPalette["red-50"]
                : ColorPalette["red-800"]
            }
            borderRadius="0.375rem"
          >
            <Body2
              color={
                theme.mode === "light"
                  ? ColorPalette["red-600"]
                  : ColorPalette["red-200"]
              }
            >
              <FormattedMessage
                id="page.sign.ethereum.eip5792.invalid-format"
                defaultMessage="Invalid request format"
              />
            </Body2>
          </Box>
        );
      }

      if (analysis.error) {
        return (
          <Box
            padding="1rem"
            backgroundColor={
              theme.mode === "light"
                ? ColorPalette["red-50"]
                : ColorPalette["red-800"]
            }
            borderRadius="0.375rem"
          >
            <Body2
              color={
                theme.mode === "light"
                  ? ColorPalette["red-600"]
                  : ColorPalette["red-200"]
              }
            >
              {analysis.error}
            </Body2>
          </Box>
        );
      }

      const isAtomicBatch = analysis.currentStrategy === "atomic";

      return (
        <YAxis>
          <BatchHeader
            request={request}
            currentStrategy={analysis.currentStrategy}
          />
          <UpgradeChoice
            analysis={analysis}
            upgradeChoice={upgradeChoice}
            setUpgradeChoice={setUpgradeChoice}
            upgradeOptions={upgradeOptions}
          />
          {isTransactionReady && (
            <React.Fragment>
              <TransactionList transactions={transactions} chainId={chainId} />
              {isAtomicBatch && request.calls && (
                <RawCallsList calls={request.calls} chainId={chainId} />
              )}
            </React.Fragment>
          )}
        </YAxis>
      );
    }
  );
