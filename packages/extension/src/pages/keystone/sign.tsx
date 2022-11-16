import { UR } from "@keplr-wallet/stores";
import { AnimatedQRCode } from "@keystonehq/animated-qr";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { Button } from "reactstrap";
import { useStore } from "../../stores";
import { Scan, ScanType } from "./scan";
import style from "./style.module.scss";

const getScanType = (urType: string | undefined): ScanType =>
  (urType &&
    {
      "eth-sign-request": ScanType.SignEth,
      "cosmos-sign-request": ScanType.SignCosmos,
    }[urType]) ||
  ScanType.SignCosmos;

export const KeystoneSignPage = observer(() => {
  const [isScan, setIsScan] = useState(false);
  const [ur, setUR] = useState({} as UR);

  const { keystoneStore } = useStore();

  const onScanFinish = async (ur: UR) => {
    keystoneStore.resolveSign({ signature: ur });
  };

  const onReject = () => {
    keystoneStore.rejectSign();
  };

  const onGetSignature = () => {
    setIsScan(true);
  };

  useEffect(() => {
    if (keystoneStore.signData) {
      setUR(keystoneStore.signData.data.ur);
    }
  }, [keystoneStore.signData]);

  useEffect(() => {
    document.documentElement.setAttribute("data-keystone-import-page", "true");
    return () => {
      document.documentElement.removeAttribute("data-keystone-import-page");
    };
  }, []);

  return isScan ? (
    <Scan
      type={getScanType(keystoneStore.signData?.data.ur.type)}
      onChange={onScanFinish}
      onCancel={onReject}
    />
  ) : (
    <div className={`${style.page} ${style.sign}`}>
      <div>
        <div className={style.title}>Request Signature</div>
        <div className={style.subtitle}>
          Scan the QR code via your Keystone device.
        </div>
        <div className={style.display}>
          {ur.cbor && (
            <AnimatedQRCode
              cbor={ur.cbor}
              type={ur.type}
              options={{ size: 210 }}
            />
          )}
        </div>
        <p className={style["help-text"]}>
          Click on the &#39;<em>Get Signature</em>&#39; button after signing the
          transaction with your Keystone device.
        </p>
        <p>
          <a href="https://keyst.one/keplr" target="_blank" rel="noreferrer">
            Tutorial
          </a>
        </p>
      </div>

      <div className={style.btns}>
        <Button onClick={onReject}>Reject</Button>
        <Button color="primary" onClick={onGetSignature}>
          Get Signature
        </Button>
      </div>
    </div>
  );
});
