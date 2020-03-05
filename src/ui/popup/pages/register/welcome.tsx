import React, { FunctionComponent } from "react";

import styleWelcome from "./welcome.module.scss";
import { Button } from "reactstrap";

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
        onClick={() => {
          if (typeof browser !== "undefined") {
            browser.tabs.getCurrent().then(tab => {
              if (tab.id) {
                browser.tabs.remove(tab.id);
              } else {
                window.close();
              }
            });
          } else {
            window.close();
          }
        }}
        block
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
