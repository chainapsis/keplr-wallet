import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../stores";
import { Card, CardBody } from "../../../components/card";
import { Text, ViewStyle, View } from "react-native";
import { useStyle } from "../../../styles";
import { useIntl } from "react-intl";
import { ProgressBar } from "../../../components/progress-bar";

export const UnbondingCard: FunctionComponent<{
  containerStyle?: ViewStyle;
  validatorAddress: string;
}> = observer(({ containerStyle, validatorAddress }) => {
  const { chainStore, accountStore, queriesStore } = useStore();

  const account = accountStore.getAccount(chainStore.current.chainId);
  const queries = queriesStore.get(chainStore.current.chainId);

  const unbonding = queries.cosmos.queryUnbondingDelegations
    .getQueryBech32Address(account.bech32Address)
    .unbondingBalances.find(
      (unbonding) => unbonding.validatorAddress === validatorAddress
    );

  const style = useStyle();

  const intl = useIntl();

  return unbonding ? (
    <Card style={containerStyle}>
      <CardBody>
        <Text style={style.flatten(["h4", "color-text-highest"])}>
          My Unstaking
        </Text>
        <View style={style.flatten(["padding-top-4", "padding-bottom-8"])}>
          {unbonding.entries.map((entry, i) => {
            const remainingText = (() => {
              const current = new Date().getTime();

              const relativeEndTime =
                (new Date(entry.completionTime).getTime() - current) / 1000;
              const relativeEndTimeDays = Math.floor(
                relativeEndTime / (3600 * 24)
              );
              const relativeEndTimeHours = Math.ceil(relativeEndTime / 3600);

              if (relativeEndTimeDays) {
                return (
                  intl
                    .formatRelativeTime(relativeEndTimeDays, "days", {
                      numeric: "always",
                    })
                    .replace("in ", "") + " left"
                );
              } else if (relativeEndTimeHours) {
                return (
                  intl
                    .formatRelativeTime(relativeEndTimeHours, "hours", {
                      numeric: "always",
                    })
                    .replace("in ", "") + " left"
                );
              }

              return "";
            })();
            const progress = (() => {
              const currentTime = new Date().getTime();
              const endTime = new Date(entry.completionTime).getTime();
              const remainingTime = Math.floor((endTime - currentTime) / 1000);
              const unbondingTime = queries.cosmos.queryStakingParams.response
                ? queries.cosmos.queryStakingParams.unbondingTimeSec
                : 3600 * 24 * 21;

              return Math.max(
                0,
                Math.min(100 - (remainingTime / unbondingTime) * 100, 100)
              );
            })();

            return (
              <View
                key={i.toString()}
                style={style.flatten(["padding-top-24"])}
              >
                <View
                  style={style.flatten([
                    "flex-row",
                    "items-center",
                    "margin-bottom-8",
                  ])}
                >
                  <Text
                    style={style.flatten(["subtitle2", "color-text-middle"])}
                  >
                    {entry.balance
                      .shrink(true)
                      .trim(true)
                      .maxDecimals(6)
                      .toString()}
                  </Text>
                  <View style={style.get("flex-1")} />
                  <Text style={style.flatten(["body2", "color-text-low"])}>
                    {remainingText}
                  </Text>
                </View>
                <View>
                  <ProgressBar progress={progress} />
                </View>
              </View>
            );
          })}
        </View>
      </CardBody>
    </Card>
  ) : null;
});
