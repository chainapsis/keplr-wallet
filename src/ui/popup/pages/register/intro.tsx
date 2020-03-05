import React, { FunctionComponent } from "react";

import styleIntro from "./intro.module.scss";

import { FormattedMessage, useIntl } from "react-intl";

export const IntroInPage: FunctionComponent<{
  onRequestNewAccount: () => void;
  onRequestRecoverAccount: () => void;
}> = props => {
  const intl = useIntl();

  return (
    <div>
      <BigButton
        icon="fa-plus"
        title={intl.formatMessage({
          id: "register.intro.button.new-account.title"
        })}
        content={intl.formatMessage({
          id: "register.intro.button.new-account.content"
        })}
        onClick={props.onRequestNewAccount}
      />
      <BigButton
        icon="fa-download"
        title={intl.formatMessage({
          id: "register.intro.button.import-account.title"
        })}
        content={intl.formatMessage({
          id: "register.intro.button.import-account.content"
        })}
        onClick={props.onRequestRecoverAccount}
      />
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

const BigButton: FunctionComponent<{
  icon: string;
  title: string;
  content: string;
  onClick: () => void;
}> = ({ icon, title, content, onClick }) => {
  return (
    <div className={styleIntro.bigButton} onClick={onClick}>
      <span className={`icon is-medium ${styleIntro.icon}`}>
        <i className={`fas fa-2x ${icon}`} />
      </span>
      <div className={styleIntro.description}>
        <div className={styleIntro.title}>{title}</div>
        <div className={styleIntro.content}>{content}</div>
      </div>
      <span className={`icon is-small ${styleIntro.arrow}`}>
        <i className="fas fa-angle-right" />
      </span>
    </div>
  );
};
