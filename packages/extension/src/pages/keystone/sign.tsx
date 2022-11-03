import { useKeystoneCosmosKeyring } from "@keplr-wallet/hooks";
import { SignData, UR } from "@keplr-wallet/stores";
import { AnimatedQRCode } from "@keystonehq/animated-qr";
import { observer } from "mobx-react-lite";
import React, { useEffect, useState } from "react";
import { Button } from "reactstrap";
import { useStore } from "../../stores";
import { Scan } from "./scan";
import style from "./style.module.scss";

export const KeystoneSignPage = observer(() => {
  const [isScan, setIsScan] = useState(false);
  const [qrcodeContent, setQrcodeContent] = useState("");

  const { keystoneStore, accountStore, chainStore } = useStore();
  const cosmosKeyring = useKeystoneCosmosKeyring();

  const onScanFinish = async (ur: UR) => {
    readResolve(ur);
    await cosmosKeyring.readKeyring();
    keystoneStore.resolveSign({
      signature: ur.cbor,
    });
  };

  const onReject = () => {
    playResolve("cancel");
    keystoneStore.rejectSign();
  };

  const onGetSignature = () => {
    playResolve("success");
  };

  let playResolve: (value: string) => void;
  cosmosKeyring.getInteraction().onPlayUR(async (ur) => {
    setQrcodeContent(ur.cbor);
    await new Promise((resolve) => {
      playResolve = resolve;
    });
  });
  let readResolve: (value: UR) => void;
  cosmosKeyring.getInteraction().onReadUR(async () => {
    setIsScan(true);
    return await new Promise((resolve) => {
      readResolve = resolve;
    });
  });

  const init = async (type: string, signData: SignData) => {
    const signature = cosmosKeyring.signAminoTransaction(
      Buffer.from(
        accountStore.getAccount(chainStore.current.chainId).pubKey
      ).toString("hex"),
      signData.message
    );
  };

  useEffect(() => {
    if (keystoneStore.signData) {
      console.log(keystoneStore.signData);
      init(keystoneStore.signData.type, keystoneStore.signData.data);
    }
  }, [keystoneStore.signData]);

  return isScan ? (
    <Scan onChange={onScanFinish} />
  ) : (
    <div className={style.page}>
      <h1>Keystone</h1>
      <div className="display">
        <h2>Scan the QR code via your Keystone device.</h2>
        {qrcodeContent && (
          <AnimatedQRCode
            cbor={qrcodeContent}
            type="bytes"
            options={{ size: 300 }}
          />
        )}
      </div>
      <div>
        <Button onClick={onReject}>Reject</Button>
        <Button color="primary" onClick={onGetSignature}>
          Get Signature
        </Button>
      </div>
    </div>
  );
});
