import activityIcon from "@assets/svg/wireframe/new-clock-white.svg";
import activitygreyIcon from "@assets/svg/wireframe/new-clock.svg";

import homeTabIcon from "@assets/svg/wireframe/new-home.svg";
import moreTabIcon from "@assets/svg/wireframe/new-more.svg";
import selectedHomeTabIcon from "@assets/svg/wireframe/selected-home.svg";
import selectedMoreTabIcon from "@assets/svg/wireframe/selected-more.svg";
import selectedStakeTabIcon from "@assets/svg/wireframe/selected-stake.svg";
import stakeTabIcon from "@assets/svg/wireframe/stake-tab.svg";
import React, { useEffect, useState } from "react";
import { CHAIN_ID_DORADO, CHAIN_ID_FETCHHUB } from "../../config.ui.var";
import { WalletActions } from "../../pages-new/main/wallet-actions";
import { useStore } from "../../stores";
import style from "./style.module.scss";
import { Tab } from "./tab";

const bottomNav = [
  {
    title: "Home",
    icon: homeTabIcon,
    activeIcon: selectedHomeTabIcon,
    path: "/",
    disabled: false,
    tooltip: "Home",
  },
  {
    title: "More",
    icon: moreTabIcon,
    activeIcon: selectedMoreTabIcon,
    path: "/more",
    disabled: false,
  },
];

export const BottomNav = () => {
  const [isAssetsOpen, setIsAssetsOpen] = useState(false);
  return !isAssetsOpen ? (
    <div className={style["bottomNavContainer"]}>
      <HomeTab />
      <StakeTab />
      <button
        style={{ cursor: "pointer" }}
        className={style["toggle"]}
        onClick={() => setIsAssetsOpen(!isAssetsOpen)}
      >
        <img src={require("@assets/svg/wireframe/openAsset.svg")} alt="" />
      </button>
      <ActivityTab />
      <MoreTab />
    </div>
  ) : (
    <WalletActions isOpen={isAssetsOpen} setIsOpen={setIsAssetsOpen} />
  );
};

const HomeTab = () => <Tab {...bottomNav[0]} />;
const StakeTab = () => {
  const { keyRingStore, chainStore } = useStore();
  const current = chainStore.current;

  const [stakingTooltip, setStakingTooltip] = useState("");
  const [z, setStakingDisabled] = useState(false);
  useEffect(() => {
    if (keyRingStore.keyRingType === "ledger") {
      setStakingTooltip("Coming soon for ledger");
      setStakingDisabled(true);
      return;
    }
    if (
      current.chainId != CHAIN_ID_DORADO &&
      current.chainId != CHAIN_ID_FETCHHUB
    ) {
      setStakingTooltip("Feature not available on this network");
      setStakingDisabled(true);
    } else {
      setStakingTooltip("");
      setStakingDisabled(false);
    }
  }, [current.chainId, keyRingStore.keyRingType]);

  return (
    <React.Fragment>
      <Tab
        title={"Stake"}
        icon={stakeTabIcon}
        activeIcon={selectedStakeTabIcon}
        path={"/validators/validator"}
        disabled={z}
        tooltip={stakingTooltip}
      />
    </React.Fragment>
  );
};

const ActivityTab = () => {
  const { keyRingStore, chainStore } = useStore();
  const current = chainStore.current;
  const [activityTooltip, setActivityTooltip] = useState("");
  const [z, setActivityDisabled] = useState(false);
  const isEvm = current.features?.includes("evm") ?? false;
  useEffect(() => {
    if (keyRingStore.keyRingType === "ledger") {
      setActivityTooltip("Coming soon for ledger");
      setActivityDisabled(true);
      return;
    }
    if (isEvm) {
      setActivityTooltip("Feature not available on this network");
      setActivityDisabled(true);
    } else {
      setActivityTooltip("");
      setActivityDisabled(false);
    }
  }, [current.chainId, keyRingStore.keyRingType]);

  return (
    <Tab
      title={"Activity"}
      icon={activitygreyIcon}
      activeIcon={activityIcon}
      path={"/activity"}
      disabled={z}
      tooltip={activityTooltip}
    />
  );
};
const MoreTab = () => <Tab {...bottomNav[1]} />;
