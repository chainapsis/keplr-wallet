import { UR } from "@keplr-wallet/stores";
import { AnimatedQRCode } from "@keystonehq/animated-qr";
import { observer } from "mobx-react-lite";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "reactstrap";
import { useStore } from "../../stores";
import { Scan, ScanType } from "./scan";
import style from "./style.module.scss";

const getScanType = (urType: string | undefined): ScanType => {
  if (urType === "eth-sign-request") {
    return ScanType.SignEth;
  }
  return ScanType.SignCosmos;
};

export const KeystoneSignPage = observer(() => {
  const [isScan, setIsScan] = useState(false);
  const [ur, setUR] = useState({} as UR);
  const isPromiseDone = useRef(false);

  const { keystoneStore } = useStore();

  const onScanFinish = async (ur: UR) => {
    isPromiseDone.current = true;
    keystoneStore.resolveSign({ signature: ur });
  };

  const onReject = useCallback(() => {
    isPromiseDone.current = true;
    keystoneStore.rejectSign();
  }, [isPromiseDone, keystoneStore]);

  const onGetSignature = () => {
    setIsScan(true);
  };

  useEffect(() => {
    if (keystoneStore.signData) {
      setUR(keystoneStore.signData.data.ur);
    }
  }, [keystoneStore.signData]);

  useEffect(() => {
    document.documentElement.setAttribute("data-keystone-page", "true");
    window.addEventListener("unload", onReject);
    return () => {
      window.removeEventListener("unload", onReject);
      if (!isPromiseDone.current) {
        keystoneStore.resolveSign({
          abort: true,
        });
      }
      document.documentElement.removeAttribute("data-keystone-page");
    };
  }, [isPromiseDone, keystoneStore, onReject]);

  return isScan ? (
    <Scan
      type={getScanType(keystoneStore.signData?.data.ur.type)}
      onChange={onScanFinish}
      onBack={() => setIsScan(false)}
    />
  ) : (
    <div className={`${style["page"]} ${style["sign"]}`}>
      <div>
        <div className={style["title"]}>Request Signature</div>
        <img
          className={style["logo"]}
          src={require("../../public/assets/img/keystone/logo.svg")}
          alt="Keystone"
        />
        <div className={style["subtitle"]}>
          Scan the QR code via your Keystone device
        </div>
        <div className={style["display"]}>
          {ur.cbor && (
            <AnimatedQRCode
              cbor={ur.cbor}
              type={ur.type}
              options={{ size: 210 }}
            />
          )}
        </div>
        <div className={style["helpText"]}>
          Click on the &#39;<em>Get Signature</em>&#39; button after signing the
          transaction with your Keystone device.
        </div>
        <div>
          <a href="https://keyst.one/t/keplr" target="_blank" rel="noreferrer">
            Tutorial
          </a>
        </div>
      </div>

      <div className={style["btns"]}>
        <Button color="danger" outline onClick={onReject}>
          Reject
        </Button>
        <Button color="primary" onClick={onGetSignature}>
          Get Signature
        </Button>
      </div>
    </div>
  );
});
