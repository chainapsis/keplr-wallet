import React, { FunctionComponent } from "react";

import styleIntro from "./intro.module.scss";

import { FormattedMessage } from "react-intl";
import { Button } from "reactstrap";

import { AdditionalSignInPrepend } from "../../../../config";

export const IntroInPage: FunctionComponent<{
  onRequestNewAccount: () => void;
  onRequestRecoverAccount: () => void;
}> = props => {
  return (
    <div className={styleIntro.innerContainer}>
      {AdditionalSignInPrepend ? (
        <React.Fragment>
          {AdditionalSignInPrepend}
          <hr />
        </React.Fragment>
      ) : null}
      <Button color="primary" outline block onClick={props.onRequestNewAccount}>
        <FormattedMessage id="register.intro.button.new-account.title" />
      </Button>
      <Button
        color="primary"
        outline
        block
        style={{ marginLeft: 0 }}
        onClick={props.onRequestRecoverAccount}
      >
        <FormattedMessage id="register.intro.button.import-account.title" />
      </Button>
      <div className={styleIntro.subContent}>
        <FormattedMessage
          id="register.intro.sub-content"
          values={{
            br: <br />
          }}
        />
      </div>
    </div>
  );
};
