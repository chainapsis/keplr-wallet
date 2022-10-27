import React, { useEffect, useState } from "react";
import { CHAIN_ID_FETCHHUB } from "../../config.ui.var";
import chatTabBlueIcon from "../../public/assets/icon/chat-blue.png";
import chatTabGreyIcon from "../../public/assets/icon/chat-grey.png";
import clockTabBlueIcon from "../../public/assets/icon/clock-blue.png";
import clockTabGreyIcon from "../../public/assets/icon/clock-grey.png";
import homeTabBlueIcon from "../../public/assets/icon/home-blue.png";
import homeTabGreyIcon from "../../public/assets/icon/home-grey.png";
import moreTabBlueIcon from "../../public/assets/icon/more-blue.png";
import moreTabGreyIcon from "../../public/assets/icon/more-grey.png";
import { useStore } from "../../stores";
import style from "./style.module.scss";
import { Tab } from "./tab";

const bottomNav = [
  {
    title: "Home",
    icon: homeTabGreyIcon,
    activeTabIcon: homeTabBlueIcon,
    path: "/",
    disabled: false,
    tooltip: "Home",
  },
  {
    title: "Activity",
    icon: clockTabGreyIcon,
    activeTabIcon: clockTabBlueIcon,
    path: "/activity",
    disabled: true,
    tooltip: "Coming Soon",
  },
  {
    title: "More",
    icon: moreTabGreyIcon,
    activeTabIcon: moreTabBlueIcon,
    path: "/more",
    disabled: false,
  },
];

export const BottomNav = () => {
  return (
    <div className={style.bottomNavContainer}>
      <HomeTab />
      <ActivityTab />
      <ChatTab />
      <MoreTab />
    </div>
  );
};

const HomeTab = () => <Tab {...bottomNav[0]} />;
const ActivityTab = () => <Tab {...bottomNav[1]} />;
const ChatTab = () => {
  const { accountStore, chainStore, queriesStore } = useStore();
  const [chatTooltip, setChatTooltip] = useState("");
  const [chatDisabled, setChatDisabled] = useState(false);
  const current = chainStore.current;
  const queries = queriesStore.get(current.chainId);
  const accountInfo = accountStore.getAccount(current.chainId);
  const balanceStakableQuery = queries.queryBalances.getQueryBech32Address(
    accountInfo.bech32Address
  ).stakable;

  const stakable = balanceStakableQuery.balance;
  const delegated = queries.cosmos.queryDelegations
    .getQueryBech32Address(accountInfo.bech32Address)
    .total.upperCase(true);
  const unbonding = queries.cosmos.queryUnbondingDelegations
    .getQueryBech32Address(accountInfo.bech32Address)
    .total.upperCase(true);
  const rewards = queries.cosmos.queryRewards.getQueryBech32Address(
    accountInfo.bech32Address
  );

  const stakableReward = rewards.stakableReward;
  const stakedSum = delegated.add(unbonding);
  const total = stakable.add(stakedSum).add(stakableReward);
  const hasBalance = total && !total.toDec().isZero();

  useEffect(() => {
    if (!hasBalance)
      setChatTooltip("You need to have FET balance to use this feature");

    if (current?.chainId !== CHAIN_ID_FETCHHUB)
      setChatTooltip("Feature not available on this network");

    if (process.env.NODE_ENV === "production")
      setChatDisabled(current?.chainId !== CHAIN_ID_FETCHHUB || !hasBalance);
  }, [current.chainId, hasBalance]);
  return (
    <Tab
      title={"Chat"}
      icon={chatTabGreyIcon}
      activeTabIcon={chatTabBlueIcon}
      path={"/chat"}
      disabled={chatDisabled}
      tooltip={chatTooltip}
    />
  );
};
const MoreTab = () => <Tab {...bottomNav[2]} />;
