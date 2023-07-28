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

export const AgoricWalletSpendActionMessage: IMessageRenderer = {
  process(chainId: string, msg) {
    if (!("type" in msg && msg.type === "swingset/WalletSpendAction")) return;

    return {
      icon: <CustomIcon />,
      title: (
        <FormattedMessage id="page.sign.components.messages.agoric.wallet-spend-action.title" />
      ),
      content: (
        <WalletSpendActionMessagePretty chainId={chainId} value={msg.value} />
      ),
    };
  },
};

type Value = {
  spend_action: string;
  owner: string;
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
  value: Value;
}> = observer(({ chainId, value }) => {
  const { queriesStore } = useStore();
  const vbankQuery = queriesStore.get(chainId).agoric.queryVbankAssets;

  if (!vbankQuery.data) {
    return <LoadingIcon />;
  }

  const { spend_action: spendActionSerialized } = value;
  const m = makeMarshal(undefined);
  const vbank = m.fromCapData(vbankQuery.data);
  const spendAction = m.fromCapData(JSON.parse(spendActionSerialized));

  const brandToInfo = new Map<string, DisplayInfo>(
    vbank.map((entry: any) => [
      entry[1].brand,
      { ...entry[1].displayInfo, petname: entry[1].issuerName },
    ])
  );

  const typeMessage = <SpendActionTypePretty action={spendAction} />;

  const gives = Object.entries(spendAction.offer?.proposal?.give ?? {}).map(
    ([kw, amount]) => {
      const brand = brandToInfo.get((amount as Amount).brand);

      const prettyAmount = brand
        ? displayAmount(brand, (amount as Amount).value)
        : "";

      return (
        <FormattedMessage
          key={kw}
          id="page.sign.components.messages.agoric.wallet-spend-action.give"
          values={{
            b,
            amount: prettyAmount,
          }}
        />
      );
    }
  );

  const wants = Object.entries(spendAction.offer?.proposal?.want ?? {}).map(
    ([kw, amount]) => {
      const brand = brandToInfo.get((amount as Amount).brand);

      const prettyAmount = brand
        ? displayAmount(brand, (amount as Amount).value)
        : "";

      return (
        <FormattedMessage
          key={kw}
          id="page.sign.components.messages.agoric.wallet-spend-action.want"
          values={{
            b,
            amount: prettyAmount,
          }}
        />
      );
    }
  );

  return (
    <Box>
      <Box marginY="0.5rem">{typeMessage}</Box>
      {gives.length > 0 && <Box marginBottom="0.5rem">{gives}</Box>}
      {wants.length > 0 && <Box marginBottom="0.5rem">{wants}</Box>}
      {spendAction.offer?.offerArgs && (
        <Box marginBottom="0.5rem">
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
        <Box>
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
});
