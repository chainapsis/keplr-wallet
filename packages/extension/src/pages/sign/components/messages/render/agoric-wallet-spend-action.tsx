import { IMessageRenderer } from "../types";
import React, { FunctionComponent } from "react";
import { FormattedMessage } from "react-intl";
import { CustomIcon } from "./custom-icon";
import { Box } from "../../../../../components/box";
import { useStore } from "../../../../../stores";
import { observer } from "mobx-react-lite";
import { makeMarshal } from "../../../utils/agoric/unmarshal";
import { LoadingIcon } from "../../../../../components/icon";
import { displayAmount } from "../../../utils/agoric/display-amount";
import yaml from "js-yaml";
import { useTheme } from "styled-components";
import { ColorPalette } from "../../../../../styles";
import { MsgWalletSpendAction } from "@keplr-wallet/proto-types/agoric/swingset/msgs";
import type { CopyBag } from "../../../utils/agoric/display-amount";

export const AgoricWalletSpendActionMessage: IMessageRenderer = {
  process(chainId: string, msg) {
    const d = (() => {
      if ("type" in msg && msg.type === "swingset/WalletSpendAction") {
        return msg.value.spend_action;
      }

      if (
        "unpacked" in msg &&
        msg.typeUrl === "/agoric.swingset.MsgWalletSpendAction"
      ) {
        return (msg.unpacked as MsgWalletSpendAction).spendAction;
      }
    })();

    if (d) {
      return {
        icon: <CustomIcon />,
        title: (
          <FormattedMessage id="page.sign.components.messages.agoric.wallet-spend-action.title" />
        ),
        content: (
          <WalletSpendActionMessagePretty
            chainId={chainId}
            spendActionSerialized={d}
          />
        ),
      };
    }
  },
};

type Amount = {
  brand: string;
  value: bigint | Array<any> | CopyBag;
};

const b = (...chunks: any) => <b>{chunks}</b>;

const SpendActionTypePretty: FunctionComponent<{ action: any }> = ({
  action,
}) => {
  if (action.method === "executeOffer") {
    return (
      <FormattedMessage
        id="page.sign.components.messages.agoric.wallet-spend-action.execute-offer"
        values={{
          b,
        }}
      />
    );
  }

  if (action.method === "tryExitOffer") {
    return (
      <FormattedMessage
        id="page.sign.components.messages.agoric.wallet-spend-action.exit-offer"
        values={{
          b,
          offerId: action.offerId,
        }}
      />
    );
  }

  return <React.Fragment />;
};

const DumpRaw: FunctionComponent<{ object: any }> = ({ object }) => {
  const theme = useTheme();

  return (
    <pre
      style={{
        margin: 0,
        color:
          theme.mode === "light"
            ? ColorPalette["gray-300"]
            : ColorPalette["gray-200"],
      }}
    >
      {yaml.dump(
        JSON.parse(
          JSON.stringify(object, (_key, value) =>
            typeof value === "bigint" ? "+" + value.toString() : value
          )
        )
      )}
    </pre>
  );
};

type DisplayInfo = {
  assetKind: string;
  decimalPlaces: number;
  petname: string;
};

const errorFetchInProgress = "fetch in progress";

const WalletSpendActionMessagePretty: FunctionComponent<{
  chainId: string;
  spendActionSerialized: string;
}> = observer(({ chainId, spendActionSerialized }) => {
  const { queriesStore } = useStore();
  const vbankQuery = queriesStore.get(chainId).agoric.queryVbankAssets;
  const brandsQuery = queriesStore.get(chainId).agoric.queryBrands;
  const m = makeMarshal(undefined);

  try {
    const vbank = vbankQuery.data ? m.fromCapData(vbankQuery.data) : [];
    const brandToInfo = new Map<string, DisplayInfo>(
      vbank.map((entry: any) => [
        entry[1].brand,
        { ...entry[1].displayInfo, petname: entry[1].issuerName },
      ])
    );

    const spendAction = m.fromCapData(JSON.parse(spendActionSerialized));
    const typeMessage = <SpendActionTypePretty action={spendAction} />;

    const formatAmount = (key: string, amount: Amount, id: string) => {
      const getDisplayInfoFromBoardAux = () => {
        const boardAuxQuery = queriesStore
          .get(chainId)
          .agoric.queryBoardAux.getBoardAux(amount.brand);

        if (brandsQuery.error) {
          throw new Error(brandsQuery.error.message);
        }
        if (boardAuxQuery.error) {
          throw new Error(boardAuxQuery.error.message);
        }
        if (!(brandsQuery.data && boardAuxQuery.data)) {
          throw new Error(errorFetchInProgress);
        }

        const boardAux = m.fromCapData(boardAuxQuery.data);
        const brands = m.fromCapData(brandsQuery.data);

        const petname = brands
          .find(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            ([_petname, boardId]: [string, string]) => boardId === amount.brand
          )
          ?.at(0);

        if (!petname) {
          throw new Error("Brand petname not found");
        }

        const { assetKind, decimalPlaces } = boardAux.displayInfo;

        return { petname, assetKind, decimalPlaces };
      };

      const { petname, assetKind, decimalPlaces } = (() => {
        const vbankInfo = brandToInfo.get(amount.brand);
        if (vbankInfo) {
          return vbankInfo;
        } else {
          try {
            return getDisplayInfoFromBoardAux();
          } catch (e) {
            if (e.msg === errorFetchInProgress) {
              throw e;
            } else if (vbankQuery.error) {
              throw vbankQuery.error;
            } else if (!vbankQuery.data) {
              throw new Error(errorFetchInProgress);
            } else {
              throw e;
            }
          }
        }
      })();

      const prettyAmount = displayAmount(
        {
          petname,
          assetKind,
          decimalPlaces,
        },
        amount.value
      );

      return (
        <React.Fragment key={key}>
          <FormattedMessage id={id} />
          {assetKind === "nat" ? (
            <b>{prettyAmount}</b>
          ) : (
            <details>
              <summary style={{ cursor: "pointer" }}>
                <b>{prettyAmount}</b>
              </summary>
              <Box marginX="0.5rem">
                <DumpRaw
                  object={(amount.value as CopyBag).payload ?? amount.value}
                />
              </Box>
            </details>
          )}
        </React.Fragment>
      );
    };

    const gives = Object.entries(spendAction.offer?.proposal?.give ?? {}).map(
      ([kw, amount]) =>
        formatAmount(
          kw,
          amount as Amount,
          "page.sign.components.messages.agoric.wallet-spend-action.give"
        )
    );

    const wants = Object.entries(spendAction.offer?.proposal?.want ?? {}).map(
      ([kw, amount]) =>
        formatAmount(
          kw,
          amount as Amount,
          "page.sign.components.messages.agoric.wallet-spend-action.want"
        )
    );

    return (
      <Box>
        <div>{typeMessage}</div>
        {gives.length > 0 && <Box marginTop="0.3rem">{gives}</Box>}
        {wants.length > 0 && <Box marginTop="0.3rem">{wants}</Box>}
        {spendAction.offer?.offerArgs && (
          <Box marginTop="0.3rem">
            <details>
              <summary style={{ cursor: "pointer" }}>
                <FormattedMessage id="page.sign.components.messages.agoric.wallet-spend-action.offer-args" />
              </summary>
              <Box marginX="0.5rem">
                <DumpRaw object={spendAction.offer.offerArgs} />
              </Box>
            </details>
          </Box>
        )}
        {spendAction.offer?.invitationSpec && (
          <Box marginTop="0.3rem">
            <details>
              <summary style={{ cursor: "pointer" }}>
                <FormattedMessage id="page.sign.components.messages.agoric.wallet-spend-action.invitation-spec" />
              </summary>
              <Box marginX="0.5rem">
                <DumpRaw object={spendAction.offer.invitationSpec} />
              </Box>
            </details>
          </Box>
        )}
      </Box>
    );
  } catch (e) {
    if (e.message == errorFetchInProgress) {
      return <LoadingIcon />;
    }
    console.log(
      "Error rendering wallet spend action, defaulting to yaml view",
      e
    );
    return <DumpRaw object={spendActionSerialized} />;
  }
});
