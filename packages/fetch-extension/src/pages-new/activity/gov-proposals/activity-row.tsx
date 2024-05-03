import { formatActivityHash } from "@utils/format";
import React from "react";
import style from "./style.module.scss";
import govPropsalIcon from "@assets/icon/gov.png";

const getVoteIcon = (vote: string): string => {
  switch (vote) {
    case "YES":
      return "gov-tick.svg";
    case "NO":
      return "gov-cross.svg";
    case "ABSTAIN":
      return "gov-abstain.svg";
    case "NO_WITH_VETO":
      return "gov-no-veto.svg";
    default:
      return "gov-tick-white.svg";
  }
};

const getHash = (proposal: any) => {
  if (proposal && proposal.id) {
    return formatActivityHash(proposal.id);
  }
  return null;
};

export const ActivityRow = ({ node }: { node: any }) => {
  const details = node.option;
  const hash = getHash(node);
  const { status, id } = node.transaction;
  return (
    <React.Fragment>
      <a
        href={`https://www.mintscan.io/fetchai/tx/${id}`}
        target="_blank"
        rel="noreferrer"
      >
        <div className={style["activityRow"]}>
          <div className={style["activityCol"]} style={{ width: "7%" }}>
            <img
              src={govPropsalIcon}
              alt={govPropsalIcon}
              className={style["govImage"]}
            />
          </div>
          <div className={style["middle"]}>
            <div className={style["activityCol"]} style={{ width: "33%" }}>
              {hash}
            </div>
            <div className={style["rowSubtitle"]} style={{ width: "53%" }}>
              {status === "Success" ? "Confirmed" : "Failed"}
            </div>
          </div>
          <div
            style={{
              width: "7%",
              justifyContent: "center",
              marginLeft: "134px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <img
              draggable={false}
              src={require("@assets/svg/" + getVoteIcon(details))}
              className={style["govImage"]}
            />{" "}
            {details}
          </div>
        </div>
      </a>
      <div className={style["hr"]} />
    </React.Fragment>
  );
};
