import React, { FunctionComponent } from "react";

import styleWelcome from "./welcome.module.scss";
import { Button } from "../../../components/button";

export const WelcomeInPage: FunctionComponent = () => {
  return (
    <div style={{ paddingTop: "60px" }}>
      <div className={styleWelcome.title}>You’re all set!</div>
      <div className={styleWelcome.content}>
        Open the extension and sign in to begin your interchain journey.
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
        Done
      </Button>
    </div>
  );
};
