import { IMessageRenderer } from "../types";
import React, { FunctionComponent } from "react";
import { FormattedMessage } from "react-intl";
import { CustomIcon } from "./custom-icon";
import { Box } from "../../../../../components/box";
import { useStore } from "../../../../../stores";
import { observer } from "mobx-react-lite";
import { makeMarshal } from "../../../utils/unmarshal";
import { LoadingIcon } from "../../../../../components/icon";
import { displayAmount } from "../../../utils/display-amount";
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

const SpendActionPretty: FunctionComponent<{
  vbank: any;
  spendAction: any;
}> = ({ vbank, spendAction }) => {
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
      <Box marginBottom="0.5rem">{typeMessage}</Box>
      {gives.length > 0 && <Box marginBottom="0.5rem">{gives}</Box>}
      {wants.length > 0 && <Box marginBottom="0.5rem">{wants}</Box>}
      {spendAction.offer?.offerArgs && (
        <Box marginBottom="0.5rem">
          <FormattedMessage id="pages.sign.components.messages.agoric.wallet-spend-action.offer-args" />
          <Box marginX="0.5rem">
            <DumpRaw object={spendAction.offer.offerArgs} />
          </Box>
        </Box>
      )}
      {spendAction.offer?.invitationSpec && (
        <Box>
          <FormattedMessage id="pages.sign.components.messages.agoric.wallet-spend-action.invitation-spec" />
          <Box marginX="0.5rem">
            <DumpRaw object={spendAction.offer.invitationSpec} />
          </Box>
        </Box>
      )}
    </Box>
  );
};

const WalletSpendActionMessagePretty: FunctionComponent<{
  chainId: string;
  value: Value;
}> = observer(({ chainId, value }) => {
  const { owner, spend_action: spendAction } = value;
  const { queriesStore } = useStore();
  const vbankQuery = queriesStore.get(chainId).agoric.queryVbankAssets;

  const m = makeMarshal(undefined);

  const spendActionPretty = vbankQuery.data ? (
    <SpendActionPretty
      vbank={m.fromCapData(vbankQuery.data as any)}
      spendAction={m.fromCapData(JSON.parse(spendAction))}
    />
  ) : (
    <LoadingIcon />
  );

  const chainIdMessage = (
    <FormattedMessage
      id="page.sign.components.messages.agoric.chain-id"
      values={{
        chainId,
        b,
      }}
    />
  );

  const ownerMessage = (
    <FormattedMessage
      id="page.sign.components.messages.agoric.owner"
      values={{
        owner,
        b,
      }}
    />
  );

  return (
    <Box>
      <Box marginY="0.5rem">{chainIdMessage}</Box>
      <Box marginBottom="0.5rem">{ownerMessage}</Box>
      {spendActionPretty}
    </Box>
  );
});
