import React, { FunctionComponent, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { PageWithSectionList } from "../../../components/page";
import { Text, View } from "react-native";
import { Staking } from "@keplr-wallet/stores";
import { useStyle } from "../../../styles";
import { SelectorModal, TextInput } from "../../../components/input";
import { useSmartNavigation } from "../../../navigation";
import { CoinPretty, Dec } from "@keplr-wallet/unit";
import { RightArrowIcon } from "../../../components/icon";
import Svg, { Path } from "react-native-svg";
import { ValidatorThumbnail } from "../../../components/thumbnail";
import { RouteProp, useRoute } from "@react-navigation/native";
import { RectButton } from "../../../components/rect-button";

type Sort = "APY" | "Voting Power" | "Name";

export const ValidatorListScreen: FunctionComponent = observer(() => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          validatorSelector?: (validatorAddress: string) => void;
        }
      >,
      string
    >
  >();

  const { chainStore, queriesStore } = useStore();

  const queries = queriesStore.get(chainStore.current.chainId);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<Sort>("Voting Power");
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);

  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Bonded
  );

  const style = useStyle();

  const data = useMemo(() => {
    let data = bondedValidators.validators;
    const searchTrim = search.trim();
    if (searchTrim) {
      data = data.filter((val) =>
        val.description.moniker
          ?.toLowerCase()
          .includes(searchTrim.toLowerCase())
      );
    }
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

  const apy = queries.cosmos.queryInflation.inflation;

  const items = useMemo(() => {
    // If inflation is 0 or not fetched properly, there is no need to sort by APY.
    if (apy.toDec().gt(new Dec(0))) {
      return [
        { label: "APY", key: "APY" },
        { label: "Amount Staked", key: "Voting Power" },
        { label: "Name", key: "Name" },
      ];
    } else {
      return [
        { label: "Amount Staked", key: "Voting Power" },
        { label: "Name", key: "Name" },
      ];
    }
  }, [apy]);

  const sortItem = useMemo(() => {
    const item = items.find((item) => item.key === sort);
    if (!item) {
      throw new Error(`Can't find the item for sort (${sort})`);
    }
    return item;
  }, [items, sort]);

  return (
    <React.Fragment>
      <SelectorModal
        close={() => {
          setIsSortModalOpen(false);
        }}
        isOpen={isSortModalOpen}
        items={items}
        selectedKey={sort}
        setSelectedKey={(key) => setSort(key as Sort)}
      />
      <PageWithSectionList
        backgroundMode="secondary"
        sections={[
          {
            data,
          },
        ]}
        stickySectionHeadersEnabled={false}
        keyExtractor={(item: Staking.Validator) => item.operator_address}
        renderItem={({
          item,
          index,
        }: {
          item: Staking.Validator;
          index: number;
        }) => {
          return (
            <ValidatorItem
              validatorAddress={item.operator_address}
              index={index}
              sort={sort}
              onSelectValidator={route.params.validatorSelector}
            />
          );
        }}
        ItemSeparatorComponent={() => (
          <View
            style={style.flatten([
              "height-1",
              "background-color-gray-50",
              "dark:background-color-platinum-500",
            ])}
          />
        )}
        renderSectionHeader={() => {
          return (
            <View>
              <View
                style={style.flatten(["absolute", "width-full", "height-full"])}
              >
                <View
                  style={style.flatten([
                    "width-full",
                    "height-full",
                    "background-color-background-secondary",
                  ])}
                />
              </View>
              <View
                style={style.flatten([
                  "padding-x-20",
                  "padding-top-12",
                  "padding-bottom-4",
                ])}
              >
                <TextInput
                  placeholder="Search"
                  containerStyle={style.flatten(["padding-0"])}
                  inputContainerStyle={style.flatten([
                    "dark:background-color-platinum-500",
                    "dark:border-width-0",
                  ])}
                  placeholderTextColor={
                    style.flatten(["dark:color-platinum-300"]).color
                  }
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
                            "color-text-low",
                            "margin-right-4",
                            "uppercase",
                          ])}
                        >
                          {sortItem.label}
                        </Text>
                        <Svg
                          width="6"
                          height="12"
                          fill={style.get("color-text-low").color}
                          viewBox="0 0 6 12"
                        >
                          <Path
                            fill={style.get("color-text-low").color}
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

  onSelectValidator?: (validatorAddress: string) => void;
}> = observer(({ validatorAddress, index, sort, onSelectValidator }) => {
  const { chainStore, queriesStore } = useStore();

  const queries = queriesStore.get(chainStore.current.chainId);

  const bondedValidators = queries.cosmos.queryValidators.getQueryStatus(
    Staking.BondStatus.Bonded
  );

  const style = useStyle();

  const validator = bondedValidators.getValidator(validatorAddress);

  const smartNavigation = useSmartNavigation();

  return validator ? (
    <RectButton
      style={style.flatten([
        "flex-row",
        "background-color-white",
        "dark:background-color-platinum-600",
        "height-72",
        "items-center",
      ])}
      onPress={() => {
        if (onSelectValidator) {
          onSelectValidator(validatorAddress);
          smartNavigation.goBack();
        } else {
          smartNavigation.navigateSmart("Validator.Details", {
            validatorAddress,
          });
        }
      }}
    >
      <View
        style={style.flatten(["items-center", "width-40", "margin-left-4"])}
      >
        <Text style={style.flatten(["body3", "color-text-middle"])}>
          {index + 1}
        </Text>
      </View>
      <ValidatorThumbnail
        style={style.flatten(["margin-right-8"])}
        size={40}
        url={bondedValidators.getValidatorThumbnail(validator.operator_address)}
      />
      <Text
        style={style.flatten(["h6", "color-text-middle", "max-width-160"])}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {validator.description.moniker}
      </Text>
      <View style={style.flatten(["flex-1"])} />
      {sort === "APY" ? (
        <Text style={style.flatten(["body3", "color-text-low"])}>
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
        <Text style={style.flatten(["body2", "color-text-low"])}>
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
        <RightArrowIcon height={14} color={style.get("color-text-low").color} />
      </View>
    </RectButton>
  ) : null;
});
