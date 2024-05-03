import React, { FunctionComponent, useState } from "react";
import { CardModal } from "modals/card";
import { Text, View, ViewStyle } from "react-native";
import { useStyle } from "styles/index";
import { IconButton } from "components/new/button/icon";
import { RectButton } from "components/rect-button";
import { BlurBackground } from "components/new/blur-background/blur-background";
import { Button } from "components/button";
import { CheckIcon } from "components/icon";
import { StakeIcon } from "components/new/icon/stake-icon";
import { UnstakedIcon } from "components/new/icon/unstaked";
import { EditIcon } from "components/new/icon/edit";
import { LeftRightCrossIcon } from "components/new/icon/left-right-cross";
import { ClaimIcon } from "components/new/icon/claim-icon";
import { IbcUpDownIcon } from "components/new/icon/ibc-up-down";
import { FilterItem } from "screens/activity";
import { UpDownArrowIcon } from "components/new/icon/up-down-arrow";

export const activityFilterOptions: FilterItem[] = [
  {
    icon: (
      <UpDownArrowIcon
        size={14}
        color1={"white"}
        color2={"white"}
        color3={"white"}
      />
    ),
    title: "Funds transfers",
    value: "/cosmos.bank.v1beta1.MsgSend",
    isSelected: true,
  },
  {
    icon: <StakeIcon size={14} />,
    title: "Staked Funds",
    value: "/cosmos.staking.v1beta1.MsgDelegate",
    isSelected: true,
  },
  {
    icon: <UnstakedIcon />,
    title: "Unstaked Funds",
    value: "/cosmos.staking.v1beta1.MsgUndelegate",
    isSelected: true,
  },
  {
    icon: <EditIcon />,
    title: "Redelegate Funds",
    value: "/cosmos.staking.v1beta1.MsgBeginRedelegate",
    isSelected: true,
  },
  {
    icon: <LeftRightCrossIcon size={20} />,
    title: "Contract Interactions",
    value:
      "/cosmos.authz.v1beta1.MsgExec,/cosmwasm.wasm.v1.MsgExecuteContract,/cosmos.authz.v1beta1.MsgRevoke",
    isSelected: true,
  },
  {
    icon: <ClaimIcon />,
    title: "Claim Rewards",
    value: "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
    isSelected: true,
  },
  {
    icon: <IbcUpDownIcon size={20} />,
    title: "IBC transfers",
    value: "/ibc.applications.transfer.v1.MsgTransfer",
    isSelected: true,
  },
];

export const ActivityFilterView: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  filters: FilterItem[];
  handleFilterChange: (selectedFilters: FilterItem[]) => void;
}> = ({ isOpen, close, filters, handleFilterChange }) => {
  const style = useStyle();
  const [selectedFilter, setSelectedFilter] = useState<FilterItem[]>([
    ...filters,
  ]);

  const handleClicks = () => {
    const anyUnselected = selectedFilter.some(
      (filter: { isSelected: boolean }) => !filter.isSelected
    );
    const updatedFilters: FilterItem[] = selectedFilter.map(
      (filter: FilterItem) => ({
        ...filter,
        isSelected: anyUnselected,
      })
    );
    setSelectedFilter([...updatedFilters]);
  };

  const allSelected = selectedFilter.every(
    (filter: { isSelected: boolean }) => filter.isSelected
  );
  const selectAllButtonText = allSelected ? "Unselect all" : "Select all";

  return (
    <CardModal
      isOpen={isOpen}
      title="Filter"
      cardStyle={style.flatten(["padding-bottom-10"]) as ViewStyle}
      disableGesture={true}
      close={close}
    >
      <Button
        text={selectAllButtonText}
        size="small"
        textStyle={style.flatten(["color-white", "body3"]) as ViewStyle}
        containerStyle={
          style.flatten([
            "border-radius-64",
            "background-color-transparent",
            "border-width-1",
            "border-color-gray-400",
          ]) as ViewStyle
        }
        onPress={handleClicks}
      />
      <View style={style.flatten(["margin-y-12"]) as ViewStyle}>
        {activityFilterOptions.map((item: FilterItem, index: number) => (
          <BlurBackground
            key={index}
            borderRadius={12}
            blurIntensity={15}
            containerStyle={
              style.flatten([
                "margin-bottom-6",
                selectedFilter[index].isSelected
                  ? "background-color-indigo"
                  : "background-color-transparent",
              ]) as ViewStyle
            }
          >
            <RectButton
              onPress={() => {
                const updatedFilters = [...selectedFilter];
                updatedFilters[index].isSelected =
                  !updatedFilters[index].isSelected;
                setSelectedFilter(updatedFilters);
              }}
              activeOpacity={0.5}
              underlayColor={style.flatten(["color-indigo"]).color}
            >
              <View
                style={
                  style.flatten([
                    "flex-row",
                    "items-center",
                    "padding-18",
                  ]) as ViewStyle
                }
              >
                <IconButton
                  backgroundBlur={false}
                  icon={item.icon}
                  iconStyle={
                    style.flatten([
                      "width-32",
                      "height-32",
                      "items-center",
                      "justify-center",
                    ]) as ViewStyle
                  }
                  containerStyle={style.flatten([]) as ViewStyle}
                />
                <Text
                  style={
                    style.flatten([
                      "body3",
                      "margin-left-18",
                      "color-white",
                    ]) as ViewStyle
                  }
                >
                  {item.title}
                </Text>
                {selectedFilter[index].isSelected && (
                  <View
                    style={style.flatten(["flex-1", "items-end"]) as ViewStyle}
                  >
                    <CheckIcon color={"transparent"} />
                  </View>
                )}
              </View>
            </RectButton>
          </BlurBackground>
        ))}
      </View>
      <Button
        text="Save changes"
        size="large"
        containerStyle={style.flatten(["border-radius-64"]) as ViewStyle}
        textStyle={style.flatten(["body2"]) as ViewStyle}
        rippleColor="black@50%"
        disabled={filters == selectedFilter}
        onPress={() => handleFilterChange(selectedFilter)}
      />
    </CardModal>
  );
};
