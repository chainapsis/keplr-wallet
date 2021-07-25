import React, { FunctionComponent, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { PageWithSectionList } from "../../../../components/staging/page";
import { Image, Text, View } from "react-native";
import {
  BondStatus,
  Validator,
} from "@keplr-wallet/stores/build/query/cosmos/staking/types";
import { useStyle } from "../../../../styles";
import { SelectorModal, TextInput } from "../../../../components/staging/input";
import { GradientBackground } from "../../../../components/svg";
import { RectButton } from "react-native-gesture-handler";
import { CardDivider } from "../../../../components/staging/card";
import { useSmartNavigation } from "../../../../navigation";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { RightArrowIcon } from "../../../../components/staging/icon";
import Svg, { Path } from "react-native-svg";

type Sort = "APY" | "Voting Power" | "Name";

export const ValidatorListScreen: FunctionComponent = observer(() => {
  const { chainStore, queriesStore } = useStore();

  const queries = queriesStore.get(chainStore.current.chainId);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<Sort>("Voting Power");
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);

  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    BondStatus.Bonded
  );

  const style = useStyle();

  const data = useMemo(() => {
    const data = bondedValidators.validators.filter((val) =>
      val.description.moniker?.toLowerCase().includes(search.toLowerCase())
    );
    switch (sort) {
      case "APY":
        data.sort((val1, val2) => {
          return new Dec(val1.commission.commission_rates.rate).gt(
            new Dec(val2.commission.commission_rates.rate)
          )
            ? 1
            : -1;
        });
        break;
      case "Name":
        data.sort((val1, val2) => {
          if (!val1.description.moniker) {
            return 1;
          }
          if (!val2.description.moniker) {
            return -1;
          }
          return val1.description.moniker > val2.description.moniker ? -1 : 1;
        });
        break;
      case "Voting Power":
        data.sort((val1, val2) => {
          return new Dec(val1.tokens).gt(new Dec(val2.tokens)) ? -1 : 1;
        });
        break;
    }

    return data;
  }, [bondedValidators.validators, search, sort]);

  return (
    <React.Fragment>
      <SelectorModal
        close={() => {
          setIsSortModalOpen(false);
        }}
        isOpen={isSortModalOpen}
        items={[
          { label: "APY", key: "APY" },
          { label: "Voting Power", key: "Voting Power" },
          { label: "Name", key: "Name" },
        ]}
        selectedKey={sort}
        setSelectedKey={(key) => setSort(key as Sort)}
      />
      <PageWithSectionList
        sections={[
          {
            data,
          },
        ]}
        stickySectionHeadersEnabled={true}
        keyExtractor={(item: Validator) => item.operator_address}
        renderItem={({ item, index }: { item: Validator; index: number }) => {
          return (
            <ValidatorItem
              validatorAddress={item.operator_address}
              index={index}
              sort={sort}
            />
          );
        }}
        ItemSeparatorComponent={() => <CardDivider />}
        renderSectionHeader={() => {
          return (
            <View>
              <View
                style={style.flatten(["absolute", "width-full", "height-full"])}
              >
                <GradientBackground />
              </View>
              <View style={style.flatten(["padding-12", "padding-bottom-4"])}>
                <TextInput
                  label="Search"
                  placeholder="Search"
                  labelStyle={style.flatten(["display-none"])}
                  containerStyle={style.flatten(["padding-0"])}
                  value={search}
                  onChangeText={(text) => {
                    setSearch(text);
                  }}
                  paragraph={
                    <View style={style.flatten(["flex-row", "margin-top-12"])}>
                      <View style={style.flatten(["flex-1"])} />
                      <RectButton
                        style={style.flatten([
                          "flex-row",
                          "items-center",
                          "padding-x-2",
                        ])}
                        onPress={() => {
                          setIsSortModalOpen(true);
                        }}
                      >
                        <Text
                          style={style.flatten([
                            "text-overline",
                            "color-text-black-low",
                            "margin-right-4",
                          ])}
                        >
                          {sort}
                        </Text>
                        <Svg
                          width="6"
                          height="12"
                          fill={style.get("color-text-black-low").color}
                          viewBox="0 0 6 12"
                        >
                          <Path
                            fill={style.get("color-text-black-low").color}
                            d="M2.625 0l2.273 4.5H.352L2.625 0zM2.625 12L.352 7.5h4.546L2.625 12z"
                          />
                        </Svg>
                      </RectButton>
                    </View>
                  }
                />
              </View>
            </View>
          );
        }}
      />
    </React.Fragment>
  );
});

const ValidatorItem: FunctionComponent<{
  validatorAddress: string;
  index: number;
  sort: Sort;
}> = observer(({ validatorAddress, index, sort }) => {
  const { chainStore, queriesStore } = useStore();

  const queries = queriesStore.get(chainStore.current.chainId);

  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    BondStatus.Bonded
  );

  const style = useStyle();

  const validator = bondedValidators.getValidator(validatorAddress);

  const smartNavigation = useSmartNavigation();

  return validator ? (
    <RectButton
      style={style.flatten([
        "flex-row",
        "background-color-white",
        "height-56",
        "items-center",
      ])}
      onPress={() => {
        smartNavigation.navigateSmart("Validator.Details", {
          validatorAddress,
        });
      }}
    >
      <View style={style.flatten(["items-center", "width-40"])}>
        <Text style={style.flatten(["body3", "color-text-black-medium"])}>
          {index + 1}
        </Text>
      </View>
      <Image
        style={style.flatten([
          "width-24",
          "height-24",
          "border-radius-32",
          "margin-right-8",
        ])}
        source={{
          uri: bondedValidators.getValidatorThumbnail(
            validator.operator_address
          ),
        }}
      />
      <Text
        style={style.flatten([
          "subtitle2",
          "color-text-black-medium",
          "max-width-160",
        ])}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {validator.description.moniker}
      </Text>
      <View style={style.flatten(["flex-1"])} />
      {sort === "APY" ? (
        <Text style={style.flatten(["body3", "color-text-black-low"])}>
          {queries.cosmos.queryInflation.inflation
            .mul(
              new Dec(1).sub(
                new Dec(validator.commission.commission_rates.rate)
              )
            )
            .maxDecimals(2)
            .trim(true)
            .toString() + "%"}
        </Text>
      ) : null}
      {sort === "Voting Power" ? (
        <Text style={style.flatten(["body3", "color-text-black-low"])}>
          {new CoinPretty(
            chainStore.current.stakeCurrency,
            new Dec(validator.tokens)
          )
            .maxDecimals(0)
            .hideDenom(true)
            .toString()}
        </Text>
      ) : null}
      <View style={style.flatten(["margin-left-12", "margin-right-20"])}>
        <RightArrowIcon
          height={14}
          color={style.get("color-text-black-low").color}
        />
      </View>
    </RectButton>
  ) : null;
});
