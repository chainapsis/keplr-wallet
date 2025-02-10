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

const NOBLE_CHAIN_ID = "noble-1";

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

  const { chainStore } = useStore();
  const [searchParams] = useSearchParams();
  const chainId = searchParams.get("chainId") || NOBLE_CHAIN_ID;
  const chainInfo = chainStore.getChain(chainId);

  const holdingCurrency = chainInfo.currencies[0];
  const rewardCurrency =
    chainId === NOBLE_CHAIN_ID
      ? chainInfo.currencies.find((c) => c.coinMinimalDenom === "uusdn")
      : null;

  return (
    <HeaderLayout
      title={intl.formatMessage({ id: "page.earn.overview.title" })}
      left={<BackToHomeButton />}
    >
      {/* TO-DO:
        - EarnClaimSection
        - EarnBalanceSection
        - EarnHistorySection
      */}
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
