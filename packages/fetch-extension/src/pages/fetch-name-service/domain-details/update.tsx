import { useNotification } from "@components/notification";
import React, { useState } from "react";
import { useNavigate } from "react-router";
import { FNS_CONFIG } from "../../../config.ui.var";
import { setPrimary, updateDomain } from "../../../name-service/fns-apis";
import { useStore } from "../../../stores";
import style from "./style.module.scss";
import { ToolTip } from "@components/tooltip";
interface UpdateProps {
  domainPrice: any;
  domainName: string;
  domainData: any;
  oldDomainData: any;
  isOwned: boolean;
  isAssigned: boolean;
  isPrimary: boolean;
}

const deepCompare: (arg1: any, arg2: any) => boolean = (
  arg1: any,
  arg2: any
) => {
  if (
    Object.prototype.toString.call(arg1) ===
    Object.prototype.toString.call(arg2)
  ) {
    if (
      Object.prototype.toString.call(arg1) === "[object Object]" ||
      Object.prototype.toString.call(arg1) === "[object Array]"
    ) {
      if (Object.keys(arg1).length !== Object.keys(arg2).length) {
        return false;
      }
      return Object.keys(arg1).every(function (key) {
        return deepCompare(arg1[key], arg2[key]);
      });
    }
    return arg1 === arg2;
  }
  return false;
};

export const Update: React.FC<UpdateProps> = ({
  domainName,
  domainData,
  oldDomainData,
  isOwned,
  isAssigned,
  isPrimary,
}) => {
  const { chainStore, accountStore } = useStore();
  const current = chainStore.current;
  const account = accountStore.getAccount(current.chainId);
  const navigate = useNavigate();
  const notification = useNotification();

  const [isTxnInProgress, setIsTxnInProgress] = useState(false);

  const parsedDomainData = Object.fromEntries(
    Object.entries(domainData).map(([key, value]: [any, any]) => [
      key,
      value === "" ? null : value,
    ])
  );

  const handleMakePrimary = async () => {
    try {
      setIsTxnInProgress(true);
      await setPrimary(current.chainId, account, domainName, notification);
      navigate(-1);
    } catch (error) {
      console.error("Error making domain as primary:", error);
    }
  };

  const handleUpdate = async () => {
    try {
      setIsTxnInProgress(true);
      await updateDomain(
        current.chainId,
        account,
        domainName,
        domainData,
        notification
      );
    } catch (error) {
      console.error("Error making domain as primary:", error);
      notification.push({
        placement: "top-center",
        type: "warning",
        duration: 2,
        content: `transaction failed!`,
        canDelete: true,
        transition: {
          duration: 0.25,
        },
      });
    }
    navigate(-1);
  };

  const handleClick = () => {
    const url = `https://www.fetns.domains/domains/${domainName}`;
    window.open(url, "_blank");
  };

  return (
    <div className={style["buttonGroup"]}>
      {isAssigned && !isPrimary && (
        <button
          className={style["mint"]}
          style={{
            marginRight: "10px",
            backgroundColor: "#1c0032",
            border: "1px solid #9075ff",
          }}
          onClick={
            FNS_CONFIG[current.chainId].isEditable
              ? handleMakePrimary
              : handleClick
          }
          disabled={isTxnInProgress}
        >
          <span className={style["domainName"]}>Make Primary</span>
        </button>
      )}
      {isOwned && (
        <span className={style["mint"]}>
          {deepCompare(parsedDomainData, oldDomainData) ? (
            <ToolTip
              tooltip="Update is disabled since data hasn't changed."
              trigger="hover"
              options={{
                placement: "top",
              }}
            >
              <button
                className={style["mint"]}
                onClick={
                  FNS_CONFIG[current.chainId].isEditable
                    ? handleUpdate
                    : handleClick
                }
                disabled={deepCompare(parsedDomainData, oldDomainData)}
              >
                <span className={style["domainName"]}>Update</span>
              </button>
            </ToolTip>
          ) : (
            <button
              className={style["mint"]}
              onClick={
                FNS_CONFIG[current.chainId].isEditable
                  ? handleUpdate
                  : handleClick
              }
              disabled={isTxnInProgress}
            >
              <span className={style["domainName"]}>Update</span>
            </button>
          )}
        </span>
      )}
    </div>
  );
};
