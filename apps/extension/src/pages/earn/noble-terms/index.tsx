import React, { FunctionComponent } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Box } from "../../../components/box";
import { Subtitle3 } from "../../../components/typography";
import { HeaderLayout } from "../../../layouts/header";
import { BackButton } from "../../../layouts/header/components";
import { ColorPalette } from "../../../styles";
import { useNavigate } from "react-router";

export const EarnNobleTermsPage: FunctionComponent = () => {
  const intl = useIntl();
  const navigate = useNavigate();

  return (
    <HeaderLayout
      title={intl.formatMessage({ id: "page.earn.terms.title" })}
      left={<BackButton />}
      bottomButtons={[
        {
          text: intl.formatMessage({ id: "button.agree" }),
          color: "primary",
          size: "large",
          type: "submit",
        },
      ]}
      onSubmit={(e) => {
        e.preventDefault();
        sessionStorage.setItem("nobleTermAgreed", "true");
        navigate(-1);
      }}
    >
      <Box paddingX="1.25rem" paddingTop="1.75rem" height="100%">
        <Subtitle3 color={ColorPalette["gray-300"]}>
          <FormattedMessage id="page.earn.terms.contents" />
        </Subtitle3>
      </Box>
    </HeaderLayout>
  );
};
