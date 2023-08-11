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

type DisplayInfo = {
  assetKind: string;
  decimalPlaces: number;
  petname: string;
};

type Amount = {
  brand: string;
  value: bigint | Array<any>;
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
            typeof value === "bigint" ? value.toString() : value
          )
        )
      )}
    </pre>
  );
};

const WalletSpendActionMessagePretty: FunctionComponent<{
  chainId: string;
  spendActionSerialized: string;
}> = observer(({ chainId, spendActionSerialized }) => {
  const { queriesStore } = useStore();
  const vbankQuery = queriesStore.get(chainId).agoric.queryVbankAssets;
  const m = makeMarshal(undefined);

  try {
    if (vbankQuery.error) {
      throw new Error(vbankQuery.error.message);
    }

    if (!vbankQuery.data) {
      return <LoadingIcon />;
    }
    const vbank = m.fromCapData(vbankQuery.data);
    const spendAction = m.fromCapData(JSON.parse(spendActionSerialized));

    const brandToInfo = new Map<string, DisplayInfo>(
      vbank.map((entry: any) => [
        entry[1].brand,
        { ...entry[1].displayInfo, petname: entry[1].issuerName },
      ])
    );

    const typeMessage = <SpendActionTypePretty action={spendAction} />;

    const formatAmount = (key: string, amount: Amount, id: string) => {
      const brand = brandToInfo.get(amount.brand);

      if (!brand) {
        throw new Error("Missing brand");
      }
      const prettyAmount = displayAmount(brand, amount.value);

      return (
        <FormattedMessage
          key={key}
          id={id}
          values={{
            b,
            amount: prettyAmount,
          }}
        />
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
    console.log(
      "Error rendering wallet spend action, defaulting to yaml view",
      e
    );
    return <DumpRaw object={spendActionSerialized} />;
  }
});
