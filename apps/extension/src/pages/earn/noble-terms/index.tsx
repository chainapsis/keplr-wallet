import React, { FunctionComponent, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { Box } from "../../../components/box";
import { HeaderLayout } from "../../../layouts/header";
import { BackButton } from "../../../layouts/header/components";
import { useNavigate } from "react-router";

export const EarnNobleTermsPage: FunctionComponent = () => {
  const intl = useIntl();
  const navigate = useNavigate();

  const [html, setHtml] = useState("");

  useEffect(() => {
    fetch("/keplr-earn-product-terms.html")
      .then((response) => response.text())
      .then((text) => setHtml(text));
  }, []);

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
      <Box paddingX="1rem" paddingTop="1.75rem" height="100%">
        <div
          dangerouslySetInnerHTML={{
            __html: html,
          }}
        />
      </Box>
    </HeaderLayout>
  );
};
