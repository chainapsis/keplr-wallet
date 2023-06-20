import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { HeaderLayout } from "../../../../layouts/header";
import { BackButton } from "../../../../layouts/header/components";
import styled from "styled-components";
import { Stack } from "../../../../components/stack";
import { Body2, H5 } from "../../../../components/typography";
import { ColorPalette } from "../../../../styles";
import { useStore } from "../../../../stores";
import { Column, Columns } from "../../../../components/column";
import { Dropdown } from "../../../../components/dropdown";
import { Box } from "../../../../components/box";
import { Button } from "../../../../components/button";
import { CopyFillIcon, KeyIcon, TrashIcon } from "../../../../components/icon";
import { useNavigate } from "react-router";
import { autorun } from "mobx";
import { TokenInfo } from "@keplr-wallet/background";
import { EmptyView } from "../../../../components/empty-view";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { useConfirm } from "../../../../hooks/confirm";
import { useNotification } from "../../../../hooks/notification";
import { Gutter } from "../../../../components/gutter";
import { Tooltip } from "../../../../components/tooltip";
import {
  PermitQueryAuthorization,
  QueryAuthorization,
} from "@keplr-wallet/background/build/secret-wasm/query-authorization";

const Styles = {
  Container: styled(Stack)`
    padding: 0 0.75rem;
  `,
  Paragraph: styled(Body2)`
    color: ${ColorPalette["gray-200"]};
    text-align: center;
    margin-bottom: 0.75rem;
  `,
};

export const SettingTokenListPage: FunctionComponent = observer(() => {
  const { chainStore, accountStore, tokensStore } = useStore();

  const navigate = useNavigate();

  const supportedChainInfos = useMemo(() => {
    return chainStore.chainInfos.filter((chainInfo) => {
      return (
        chainInfo.features?.includes("cosmwasm") ||
        chainInfo.features?.includes("secretwasm")
      );
    });
  }, [chainStore.chainInfos]);

  const [chainId, setChainId] = useState<string>(() => {
    if (supportedChainInfos.length > 0) {
      return supportedChainInfos[0].chainId;
    } else {
      return chainStore.chainInfos[0].chainId;
    }
  });

  useEffect(() => {
    // secret20은 계정에 귀속되기 때문에 보려면 계정이 초기화되어있어야 가능하다...
    const disposal = autorun(() => {
      const account = accountStore.getAccount(chainId);
      if (account.bech32Address === "") {
        account.init();
      }
    });

    return () => {
      if (disposal) {
        disposal();
      }
    };
  }, [accountStore, chainId]);

  const items = supportedChainInfos.map((chainInfo) => {
    return {
      key: chainInfo.chainId,
      label: chainInfo.chainName,
    };
  });

  const tokens = tokensStore.getTokens(chainId);

  return (
    <HeaderLayout title="Manage Token List" left={<BackButton />}>
      <Styles.Container gutter="0.5rem">
        <Styles.Paragraph>
          Only for the tokens that can be added manually via contract addresses
        </Styles.Paragraph>

        <Columns sum={1} alignY="center">
          <Box width="13rem">
            <Dropdown
              items={items}
              selectedItemKey={chainId}
              onSelect={setChainId}
            />
          </Box>

          <Column weight={1} />

          <Button
            color="secondary"
            size="extraSmall"
            text="Add Token"
            onClick={() => navigate(`/setting/token/add?chainId=${chainId}`)}
          />
        </Columns>

        {tokens.length === 0 ? (
          <React.Fragment>
            <Gutter size="7.5rem" direction="vertical" />
            <EmptyView subject="Token" />
          </React.Fragment>
        ) : (
          tokens.map((token) => {
            return (
              <TokenItem
                key={token.currency.coinMinimalDenom}
                chainId={chainId}
                tokenInfo={token}
              />
            );
          })
        )}
      </Styles.Container>
    </HeaderLayout>
  );
});

const ItemStyles = {
  Container: styled.div`
    padding: 1rem;
    background-color: ${ColorPalette["gray-600"]};
    border-radius: 0.375rem;
  `,
  Denom: styled(H5)`
    color: ${ColorPalette["gray-10"]};
  `,
  Address: styled(Body2)`
    color: ${ColorPalette["gray-200"]};
  `,
  Icon: styled.div`
    color: ${ColorPalette["gray-10"]};
    cursor: pointer;
  `,
};

const TokenItem: FunctionComponent<{
  chainId: string;
  tokenInfo: TokenInfo;
}> = observer(({ chainId, tokenInfo }) => {
  const { tokensStore } = useStore();
  const notification = useNotification();

  const isSecret20 = (() => {
    if ("type" in tokenInfo.currency) {
      return tokenInfo.currency.type === "secret20";
    }
    return false;
  })();

  const secret20AuthorizationType = (() => {
    if (
      "type" in tokenInfo.currency &&
      tokenInfo.currency.type === "secret20"
    ) {
      const queryAuthorization = QueryAuthorization.fromInput(
        tokenInfo.currency.authorizationStr
      );
      if (queryAuthorization instanceof PermitQueryAuthorization) {
        return "Permit";
      } else {
        return "Viewing Key";
      }
    }
    return "";
  })();

  const confirm = useConfirm();

  return (
    <ItemStyles.Container>
      <Columns sum={1}>
        <Stack gutter="0.25rem">
          <ItemStyles.Denom>{tokenInfo.currency.coinDenom}</ItemStyles.Denom>
          <ItemStyles.Address>
            {(() => {
              if ("contractAddress" in tokenInfo.currency) {
                return Bech32Address.shortenAddress(
                  tokenInfo.currency.contractAddress,
                  26
                );
              }
              return "Unknown";
            })()}
          </ItemStyles.Address>
        </Stack>

        <Column weight={1} />

        <Columns sum={1} gutter="0.5rem" alignY="center">
          {isSecret20 ? (
            <Tooltip content={`Copy ${secret20AuthorizationType}`}>
              <ItemStyles.Icon
                onClick={async (e) => {
                  e.preventDefault();

                  if (
                    "type" in tokenInfo.currency &&
                    tokenInfo.currency.type === "secret20"
                  ) {
                    await navigator.clipboard.writeText(
                      tokenInfo.currency.authorizationStr
                    );

                    notification.show("success", "Viewing key copied", "");
                  }
                }}
              >
                <KeyIcon width="1.25rem" height="1.25rem" />
              </ItemStyles.Icon>
            </Tooltip>
          ) : null}

          <Tooltip content="Copy Contract Address">
            <ItemStyles.Icon
              onClick={async (e) => {
                e.preventDefault();

                if ("contractAddress" in tokenInfo.currency) {
                  await navigator.clipboard.writeText(
                    tokenInfo.currency.contractAddress
                  );

                  notification.show("success", "Contract address copied", "");
                }
              }}
            >
              <CopyFillIcon width="1.25rem" height="1.25rem" />
            </ItemStyles.Icon>
          </Tooltip>

          <Tooltip content="Disable Token">
            <ItemStyles.Icon
              onClick={async (e) => {
                e.preventDefault();

                if (
                  await confirm.confirm(
                    "",
                    "Are you sure you’d like to disable this token? You will not be able to see your balance or transfer until you add it again."
                  )
                ) {
                  await tokensStore.removeToken(chainId, tokenInfo);
                }
              }}
            >
              <TrashIcon width="1.25rem" height="1.25rem" />
            </ItemStyles.Icon>
          </Tooltip>
        </Columns>
      </Columns>
    </ItemStyles.Container>
  );
});
