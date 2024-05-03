import React, { useEffect, useState } from "react";
import { Text, View, ViewStyle } from "react-native";
import moment from "moment";
import { DetailRows } from "screens/activity/activity-details/details-rows";
import { useStyle } from "styles/index";
import { RouteProp, useRoute } from "@react-navigation/native";
import { PageWithScrollView } from "components/page";
import { FetchAiIcon } from "components/new/icon/fetchai-icon";
import { useStore } from "stores/index";
import { CoinPretty, Int } from "@keplr-wallet/unit";
import { formatAddress } from "utils/format/format";
import { LeftRightCrossIcon } from "components/new/icon/left-right-cross";
import { IconButton } from "components/new/button/icon";
import { getActivityIcon } from "utils/stable-sort";
import { BlurBackground } from "components/new/blur-background/blur-background";
import { TimelineView } from "components/new/timeline";

export const ActivityDetails = () => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          details: any;
        }
      >,
      any
    >
  >();

  const details = route.params.details;
  const style = useStyle();
  const { priceStore } = useStore();
  const [usdValue, setUsdValue] = useState<any>("$0");
  const fiatCurrency = details.fiatCurrency;
  const currency = {
    coinDenom: "FET",
    coinMinimalDenom: "afet",
    coinDecimals: 18,
    coinGeckoId: "fetch-ai",
  };

  useEffect(() => {
    if (details.amt) {
      const amountInNumber = parseFloat(
        details.amt.amount ? details.amt.amount : details.amt[0].amount
      );
      const inputValue = new CoinPretty(currency, new Int(amountInNumber));
      const inputValueInUsd = convertTofiatCurrency(inputValue);
      setUsdValue(inputValueInUsd);
    }
  }, []);

  const convertTofiatCurrency = (currency: CoinPretty) => {
    const value = priceStore.calculatePrice(currency, fiatCurrency);
    return value && value.shrink(true).maxDecimals(6).toString();
  };

  const toAddress = (details: {
    toAddress: any;
    validatorAddress: any;
    validatorDstAddress: any;
    verb: string;
    receiver: any;
  }) => {
    switch (true) {
      case Boolean(details.toAddress):
        return formatAddress(details.toAddress);
      case Boolean(details.validatorAddress):
        return formatAddress(details.validatorAddress);
      case Boolean(details.validatorDstAddress):
        return formatAddress(details.validatorDstAddress);
      case details.verb == "IBC transfer":
        return formatAddress(details.receiver);
      default:
        return "";
    }
  };

  return (
    <PageWithScrollView backgroundMode={"image"}>
      <View style={style.flatten(["items-center"]) as ViewStyle}>
        <View
          style={
            style.flatten([
              "padding-16",
              "border-radius-64",
              "background-color-indigo-900",
            ]) as ViewStyle
          }
        >
          <FetchAiIcon size={20} />
        </View>
        <Text
          style={
            style.flatten(["color-white", "h4", "margin-top-10"]) as ViewStyle
          }
        >
          {details.verb}
        </Text>
        <Text style={style.flatten(["color-gray-200", "h7"]) as ViewStyle}>
          {moment(details.timestamp).utc().format("MMMM DD, hh:mm A")}
        </Text>
      </View>
      <View style={style.flatten(["margin-y-16"]) as ViewStyle}>
        {details.verb === "Smart Contract Interaction" ? (
          <BlurBackground
            borderRadius={12}
            blurIntensity={15}
            containerStyle={
              style.flatten(["margin-12", "padding-16"]) as ViewStyle
            }
          >
            <TimelineView
              data={[
                {
                  icon: (
                    <IconButton
                      icon={<LeftRightCrossIcon size={20} />}
                      backgroundBlur={true}
                      iconStyle={
                        style.flatten([
                          "width-32",
                          "height-32",
                          "items-center",
                          "justify-center",
                        ]) as ViewStyle
                      }
                    />
                  ),
                  leadingSubtitle: "Smart Contract",
                  trailingTitle: `${details.amountNumber} ${details.amountAlphabetic}`,
                  trailingSubtitle: usdValue,
                },
              ]}
            />
          </BlurBackground>
        ) : (
          <BlurBackground
            borderRadius={12}
            blurIntensity={15}
            containerStyle={
              style.flatten(["margin-12", "padding-16"]) as ViewStyle
            }
          >
            <TimelineView
              trailingTitleStyle={
                style.flatten([
                  details.verb == "Received"
                    ? "color-green-400"
                    : "color-white",
                ]) as ViewStyle
              }
              data={[
                {
                  icon: (
                    <IconButton
                      icon={getActivityIcon("")}
                      backgroundBlur={true}
                      iconStyle={
                        style.flatten([
                          "width-32",
                          "height-32",
                          "items-center",
                          "justify-center",
                        ]) as ViewStyle
                      }
                    />
                  ),
                  leadingTitle: details.signerAddress
                    ? "From"
                    : "Delegator Address",
                  leadingSubtitle: formatAddress(
                    details.signerAddress
                      ? details.signerAddress
                      : details.deligatorAddress
                  ),
                },
                {
                  icon: (
                    <IconButton
                      icon={getActivityIcon(details.verb)}
                      backgroundBlur={true}
                      iconStyle={
                        style.flatten([
                          "width-32",
                          "height-32",
                          "items-center",
                          "justify-center",
                        ]) as ViewStyle
                      }
                    />
                  ),
                  leadingTitle: details.toAddress
                    ? "To"
                    : details.verb == "IBC transfer"
                    ? "Receiver"
                    : "Validator address",
                  leadingSubtitle: toAddress(details),
                  trailingTitle: `${details.amountNumber} ${details.amountAlphabetic}`,
                  trailingSubtitle: usdValue != "$0" ? usdValue : undefined,
                },
              ]}
            />
          </BlurBackground>
        )}
      </View>
      <DetailRows details={details} />
    </PageWithScrollView>
  );
};
