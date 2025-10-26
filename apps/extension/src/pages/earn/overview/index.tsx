import { observer } from "mobx-react-lite";
import React, { FunctionComponent, useState } from "react";
import { HeaderLayout } from "../../../layouts/header";
import { useIntl } from "react-intl";
import { Box } from "../../../components/box";
import { ArrowLeftIcon } from "../../../components/icon";
import { useNavigate } from "react-router";
import { Modal } from "../../../components/modal";
import { EarnOverviewTutorialModal } from "./tutorial-modal";
import { useSearchParams } from "react-router-dom";
import { useStore } from "../../../stores";
import { Gutter } from "../../../components/gutter";
import { Divider } from "../../../components/divder";
import { EarnOverviewClaimSection } from "../components/overview-claim-section";
import { EarnOverviewBalanceSection } from "../components/overview-balance-section";
import { NOBLE_CHAIN_ID } from "../../../config.ui";
import { EarnOverviewHistorySection } from "../components/overview-history-section";
import { EarnOverviewExternalLink } from "../components/overview-external-link";

const NOBLE_POINTS_URL = "https://points.noble.xyz/";
const USDN_CURRENCY = {
  coinDenom: "USDN",
  coinMinimalDenom: "uusdn",
  coinDecimals: 6,
};

export const EarnOverviewPage: FunctionComponent = observer(() => {
  const intl = useIntl();

  const isOnceTutorialModalOpen =
    localStorage.getItem("isOnceTutorialModalOpen") === "true";

  const [isTutorialModalOpen, setIsTutorialModalOpen] = useState(
    !isOnceTutorialModalOpen
  );

  const handleCloseTutorialModal = () => {
    setIsTutorialModalOpen(false);
    localStorage.setItem("isOnceTutorialModalOpen", "true");
  };

  const { chainStore, accountStore } = useStore();
  const [searchParams] = useSearchParams();
  const chainId = searchParams.get("chainId") || NOBLE_CHAIN_ID;
  const chainInfo = chainStore.getModularChain(chainId);
  if (!("cosmos" in chainInfo)) {
    throw new Error("cosmos module is not supported on this chain");
  }

  const account = accountStore.getAccount(NOBLE_CHAIN_ID);

  const holdingCurrency = chainInfo.cosmos.currencies[0];
  const rewardCurrency =
    chainInfo.cosmos.currencies.find((c) => c.coinMinimalDenom === "uusdn") ??
    USDN_CURRENCY;

  return (
    <HeaderLayout
      title={intl.formatMessage({ id: "page.earn.overview.title" })}
      left={<BackToHomeButton />}
    >
      <Gutter size="1.25rem" />

      <EarnOverviewClaimSection chainId={chainId} currency={rewardCurrency} />

      <Divider direction="horizontal" spacing="1.625rem" />

      <EarnOverviewBalanceSection
        chainId={chainId}
        holdingCurrency={holdingCurrency}
        rewardCurrency={rewardCurrency}
        bech32Address={account.bech32Address}
      />

      <Gutter size="1.5rem" />
      <Divider direction="horizontal" />

      <EarnOverviewExternalLink
        coinDenom={rewardCurrency.coinDenom}
        url={NOBLE_POINTS_URL}
      />

      <Divider direction="horizontal" />
      <Gutter size="1.5rem" />

      <EarnOverviewHistorySection chainInfo={chainInfo} />

      <Modal
        isOpen={isTutorialModalOpen}
        close={handleCloseTutorialModal}
        align="center"
      >
        <EarnOverviewTutorialModal
          holdingCurrency={holdingCurrency}
          rewardDenom={rewardCurrency?.coinDenom ?? "USDN"}
          onClose={handleCloseTutorialModal}
        />
      </Modal>
    </HeaderLayout>
  );
});

const BackToHomeButton: FunctionComponent = () => {
  const navigate = useNavigate();

  return (
    <Box paddingLeft="1rem" cursor="pointer" onClick={() => navigate("/")}>
      <ArrowLeftIcon />
    </Box>
  );
};
