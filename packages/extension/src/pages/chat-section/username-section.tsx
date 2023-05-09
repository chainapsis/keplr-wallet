/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { useIntl } from "react-intl";
import { useHistory } from "react-router";
import { useNotification } from "@components/notification";
import { ToolTip } from "@components/tooltip";
import chevronLeft from "@assets/icon/chevron-left.png";
import moreIcon from "@assets/icon/more-grey.png";
import { formatAddress } from "@utils/format";
import style from "./style.module.scss";

export const UserNameSection = ({
  handleDropDown,
  addresses,
}: {
  handleDropDown: any;
  addresses: any;
}) => {
  const history = useHistory();
  const notification = useNotification();
  const intl = useIntl();

  const userName = history.location.pathname.split("/")[2];

  const contactName = (addresses: any) => {
    let val = "";
    for (let i = 0; i < addresses.length; i++) {
      if (addresses[i].address == userName) {
        val = addresses[i].name;
      }
    }
    return val;
  };

  const copyAddress = async (address: string) => {
    await navigator.clipboard.writeText(address);
    notification.push({
      placement: "top-center",
      type: "success",
      duration: 2,
      content: intl.formatMessage({
        id: "main.address.copied",
      }),
      canDelete: true,
      transition: {
        duration: 0.25,
      },
    });
  };

  return (
    <div className={style.username}>
      <div className={style.leftBox}>
        <img
          alt=""
          draggable="false"
          className={style.backBtn}
          src={chevronLeft}
          onClick={() => {
            history.goBack();
          }}
        />
        <span className={style.recieverName}>
          <ToolTip
            tooltip={
              contactName(addresses).length ? contactName(addresses) : userName
            }
            theme="dark"
            trigger="hover"
            options={{
              placement: "top",
            }}
          >
            <div className={style.user}>
              {contactName(addresses).length
                ? formatAddress(contactName(addresses))
                : formatAddress(userName)}
            </div>
          </ToolTip>
        </span>
        <span className={style.copyIcon} onClick={() => copyAddress(userName)}>
          <i className="fas fa-copy" />
        </span>
      </div>
      <div className={style.rightBox}>
        <img
          alt=""
          draggable="false"
          style={{ cursor: "pointer" }}
          className={style.more}
          src={moreIcon}
          onClick={(e) => {
            e.stopPropagation();
            handleDropDown();
          }}
          onBlur={handleDropDown}
        />
      </div>
    </div>
  );
};
