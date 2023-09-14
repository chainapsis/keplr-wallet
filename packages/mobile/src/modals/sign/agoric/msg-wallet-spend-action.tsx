import React, { FunctionComponent } from "react";
import { Text, View } from "react-native";
import { CopyBag, displayAmount } from "../../../utils/agoric/display-amount";
import { ColorPalette, useStyle } from "../../../styles";
import { makeMarshal } from "../../../utils/agoric/unmarshal";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { LoadingSpinner } from "../../../components/spinner";
import yaml from "js-yaml";

export interface MsgWalletSpendAction {
  value: {
    spend_action: string;
  };
}

export const renderMsgWalletSpendAction = (
  chainId: string,
  spendAction: string
) => ({
  title: "Wallet Spend Action",
  content: (
    <WalletSpendActionMessagePretty
      chainId={chainId}
      spendActionSerialized={spendAction}
    />
  ),
});

type Amount = {
  brand: string;
  value: bigint | Array<any> | CopyBag;
};

const SpendActionTypePretty: FunctionComponent<{ action: any }> = ({
  action,
}) => {
  const style = useStyle();

  if (action.method === "executeOffer") {
    return (
      <Text style={style.get("color-text-low")}>
        Execute an offer with the following parameters:
      </Text>
    );
  }

  if (action.method === "tryExitOffer") {
    return (
      <Text style={style.get("color-text-low")}>
        Exit offer with id{" "}
        <Text style={style.flatten(["font-bold", "color-text-low"])}>
          {action.offerId}
        </Text>
      </Text>
    );
  }

  return <View />;
};

const DumpRaw: FunctionComponent<{ object: any }> = ({ object }) => {
  const style = useStyle();

  return (
    <Text style={style.flatten(["color-text-low"])}>
      {yaml.dump(
        JSON.parse(
          JSON.stringify(object, (_key, value) =>
            typeof value === "bigint" ? "+" + value.toString() : value
          )
        )
      )}
    </Text>
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
  const style = useStyle();
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

    const formatAmount = (key: string, amount: Amount, entryType: string) => {
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
          } catch (e: any) {
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
        <View key={key}>
          <Text style={style.get("color-text-low")}>{entryType}</Text>
          {assetKind === "nat" ? (
            <Text style={style.flatten(["font-bold", "color-text-low"])}>
              {prettyAmount}
            </Text>
          ) : (
            <View>
              <Text style={style.flatten(["font-bold", "color-text-low"])}>
                {prettyAmount}
              </Text>
              <View style={style.get("margin-left-6")}>
                <DumpRaw
                  object={(amount.value as CopyBag).payload ?? amount.value}
                />
              </View>
            </View>
          )}
        </View>
      );
    };

    const gives = Object.entries(
      spendAction.offer?.proposal?.give ?? {}
    ).map(([kw, amount]) => formatAmount(kw, amount as Amount, "Give"));

    const wants = Object.entries(
      spendAction.offer?.proposal?.want ?? {}
    ).map(([kw, amount]) => formatAmount(kw, amount as Amount, "Want"));

    return (
      <View>
        {typeMessage}
        {gives.length > 0 && (
          <View style={style.get("margin-top-4")}>{gives}</View>
        )}
        {wants.length > 0 && (
          <View style={style.get("margin-top-4")}>{wants}</View>
        )}
        {spendAction.offer?.offerArgs && (
          <View>
            <Text style={style.get("color-text-low")}>Offer Args</Text>
            <View style={style.get("margin-left-6")}>
              <DumpRaw object={spendAction.offer.offerArgs} />
            </View>
          </View>
        )}
        {spendAction.offer?.invitationSpec && (
          <View style={style.get("margin-top-4")}>
            <Text style={style.get("color-text-low")}>Invitation Spec:</Text>
            <View style={style.get("margin-left-6")}>
              <DumpRaw object={spendAction.offer.invitationSpec} />
            </View>
          </View>
        )}
      </View>
    );
  } catch (e: any) {
    if (e.message == errorFetchInProgress) {
      return <LoadingSpinner color={ColorPalette["blue-300"]} size={40} />;
    }
    console.log(
      "Error rendering wallet spend action, defaulting to yaml view",
      e
    );
    return <DumpRaw object={spendActionSerialized} />;
  }
});
