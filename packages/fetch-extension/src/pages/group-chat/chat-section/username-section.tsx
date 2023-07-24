/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router";
import { useNotification } from "@components/notification";
import { ToolTip } from "@components/tooltip";
import chevronLeft from "@assets/icon/chevron-left.png";
import moreIcon from "@assets/icon/more-grey.png";
import style from "./style.module.scss";
import { formatGroupName } from "@utils/format";

export const UserNameSection = ({
  handleDropDown,
  groupName,
}: {
  handleDropDown: any;
  groupName: string;
}) => {
  const navigate = useNavigate();
  const notification = useNotification();
  const intl = useIntl();

  const copyAddress = async (address: string) => {
    await navigator.clipboard.writeText(address);
    notification.push({
      placement: "top-center",
      type: "success",
      duration: 2,
      content: intl.formatMessage({
        id: "main.name.copied",
      }),
      canDelete: true,
      transition: {
        duration: 0.25,
      },
    });
  };

  return (
    <div className={style["username"]}>
      <div className={style["leftBox"]}>
        <img
          alt=""
          className={style["backBtn"]}
          src={chevronLeft}
          onClick={() => {
            navigate(-1);
          }}
        />

        <ToolTip
          tooltip={groupName}
          theme="dark"
          trigger="hover"
          options={{
            placement: "top",
          }}
        >
          <span className={style["recieverName"]}>
            {formatGroupName(groupName)}
          </span>
        </ToolTip>

        <span
          className={style["copyIcon"]}
          onClick={() => copyAddress(groupName)}
        >
          <i className="fas fa-copy" />
        </span>
      </div>
      <div className={style["rightBox"]}>
        <img
          alt=""
          style={{ cursor: "pointer" }}
          className={style["more"]}
          src={moreIcon}
          onClick={handleDropDown}
          onBlur={handleDropDown}
        />
      </div>
    </div>
  );
};
