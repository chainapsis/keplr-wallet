import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { HeaderLayout } from "../../../layouts/header";
import { BackButton } from "../../../layouts/header/components";

import { useIntl } from "react-intl";

import { Button } from "../../../components/button";
import { useNavigate } from "react-router";
import { Box } from "../../../components/box";
import { useSearchParams } from "react-router-dom";

export const EarnIntroPage: FunctionComponent = observer(() => {
  const navigate = useNavigate();
  const intl = useIntl();

  const [searchParams] = useSearchParams();
  const chainId = searchParams.get("chainId") || "noble-1"; // Noble testnet: "grand-1", mainnet: "noble-1"

  return (
    <HeaderLayout
      title={intl.formatMessage({ id: "page.earn.title" })}
      fixedHeight={true}
      left={<BackButton />}
    >
      <Box paddingX="0.75rem">
        <Button
          size="large"
          color="primary"
          text={intl.formatMessage({
            id: "page.earn.intro.start-earning-button",
          })}
          onClick={() => {
            navigate(`/earn/amount?chainId=${chainId}`);
          }}
        />
      </Box>
    </HeaderLayout>
  );
});
