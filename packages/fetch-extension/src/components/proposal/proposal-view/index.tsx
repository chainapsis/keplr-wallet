import React from "react";
import { FunctionComponent } from "react";
import style from "./style.module.scss";
import classnames from "classnames";
import { FormattedMessage } from "react-intl";
import { Button } from "reactstrap";
import { useNavigate } from "react-router";
import { useStore } from "../../../stores";

export const ProposalView: FunctionComponent = () => {
  const navigate = useNavigate();
  const { analyticsStore } = useStore();

  return (
    <div className={style["containerInner"]}>
      <div className={style["vertical"]}>
        <p
          className={classnames(
            "h2",
            "my-0",
            "font-weight-normal",
            style["paragraphMain"]
          )}
        >
          <FormattedMessage id="main.proposals.title" />
        </p>
        <p
          className={classnames(
            "h4",
            "my-0",
            "font-weight-normal",
            style["paragraphSub"]
          )}
        >
          <FormattedMessage id="main.proposals.paragraph" />
        </p>
      </div>
      <div style={{ flex: 1 }} />

      <Button
        className={style["button"]}
        color="primary"
        size="sm"
        onClick={() => {
          analyticsStore.logEvent("proposal_view_click");
          navigate("/proposal");
        }}
      >
        <FormattedMessage id="main.proposals.button" />
      </Button>
    </div>
  );
};
