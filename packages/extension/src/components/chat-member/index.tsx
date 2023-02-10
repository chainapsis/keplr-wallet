import { fromBech32 } from "@cosmjs/encoding";
import jazzicon from "@metamask/jazzicon";
import React, { ReactElement, useEffect, useState } from "react";
import ReactHtmlParser from "react-html-parser";
import { NameAddress } from "@chatTypes";
import { formatAddress } from "@utils/format";
import style from "./style.module.scss";
import classnames from "classnames";
import { fetchPublicKey } from "@utils/fetch-public-key";
import { userDetails } from "@chatStore/user-slice";
import { useSelector } from "react-redux";
import { useStore } from "../../stores";

export const ChatMember = (props: {
  address: NameAddress;
  showSelectedIcon?: boolean;
  isSelected?: boolean;
  isShowAdmin?: boolean;
  showPointer?: boolean;
  onIconClick?: VoidCallback;
  onClick?: VoidCallback;
}) => {
  const { name, address } = props.address;
  const {
    isSelected,
    isShowAdmin,
    showSelectedIcon = true,
    showPointer = false,
    onIconClick,
    onClick,
  } = props;

  const user = useSelector(userDetails);
  const { chainStore } = useStore();
  const current = chainStore.current;

  const [isActive, setIsActive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const isUserActive = async () => {
      try {
        const pubKey = await fetchPublicKey(
          user.accessToken,
          current.chainId,
          address
        );
        if (!pubKey || !pubKey.publicKey || !(pubKey.publicKey.length > 0))
          setIsActive(false);
      } catch (e) {
        console.log("NewUser/isUserActive error", e);
      } finally {
        setIsLoading(false);
      }
    };
    isUserActive();
  }, [
    address,
    user.accessToken,
    user.messagingPubKey.privacySetting,
    user.messagingPubKey.chatReadReceiptSetting,
    current.chainId,
  ]);

  function decideIconLabelView(): ReactElement {
    if (isLoading) {
      return <i className="fas fa-spinner fa-spin ml-1" />;
    }

    if (isActive && isShowAdmin) {
      return <div className={style.adminHeading}>Admin </div>;
    }

    if (isActive && showSelectedIcon) {
      return (
        <div>
          <i
            className={!isSelected ? "fa fa-user-plus" : "fa fa-times"}
            style={{
              width: "24px",
              height: "24px",
              padding: "2px 0 0 12px",
              cursor: "pointer",
              alignItems: "end",
              alignSelf: "end",
            }}
            aria-hidden="true"
            onClick={onIconClick}
          />
        </div>
      );
    }

    return <></>;
  }

  return (
    <div
      className={classnames(
        style.memberContainer,
        showPointer || isActive ? style.showPointer : {}
      )}
      {...(isActive && { onClick: onClick })}
    >
      <div className={style.initials}>
        {ReactHtmlParser(
          jazzicon(24, parseInt(fromBech32(address).data.toString(), 16))
            .outerHTML
        )}
      </div>
      <div className={style.memberInner}>
        <div className={style.name}>{formatAddress(name)}</div>
        {!isActive && <div className={style.name}>Inactive</div>}
      </div>
      {decideIconLabelView()}
    </div>
  );
};
