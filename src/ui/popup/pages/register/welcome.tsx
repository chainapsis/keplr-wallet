import React, { FunctionComponent } from "react";

import styleWelcome from "./welcome.module.scss";
import { Button } from "../../../components/button";

import { useIntl } from "react-intl";

export const WelcomeInPage: FunctionComponent = () => {
  const intl = useIntl();

  return (
    <div style={{ paddingTop: "60px" }}>
      <div className={styleWelcome.title}>
        {intl.formatMessage({
          id: "register.welcome.title"
        })}
      </div>
      <div className={styleWelcome.content}>
        {intl.formatMessage({
          id: "register.welcome.content"
        })}
      </div>
      <Button
        color="primary"
        type="submit"
        size="medium"
        onClick={() => {
          window.close();
        }}
        fullwidth
        style={{
          marginTop: "60px"
        }}
      >
        {intl.formatMessage({
          id: "register.welcome.button.done"
        })}
      </Button>
    </div>
  );
};
