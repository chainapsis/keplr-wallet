import React, { FunctionComponent, useMemo } from "react";
import { SignDocWrapper } from "@keplr-wallet/cosmos";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { Buffer } from "buffer/";
import { MsgRender } from "./details-tab";
import styleDetailsTab from "./details-tab.module.scss";
import { Label } from "reactstrap";

export const ADR36SignDocDetailsTab: FunctionComponent<{
  signDocWrapper: SignDocWrapper;
  isADR36WithString?: boolean;
  origin?: string;
}> = observer(({ signDocWrapper, isADR36WithString, origin }) => {
  const { chainStore } = useStore();

  const signValue = useMemo(() => {
    if (signDocWrapper.aminoSignDoc.msgs.length !== 1) {
      throw new Error("Sign doc is inproper ADR-36");
    }

    const msg = signDocWrapper.aminoSignDoc.msgs[0];
    if (msg.type !== "sign/MsgSignData") {
      throw new Error("Sign doc is inproper ADR-36");
    }

    if (isADR36WithString) {
      const str = Buffer.from(msg.value.data, "base64").toString();

      try {
        // In case of json, it is displayed more easily to read.
        return JSON.stringify(JSON.parse(str), null, 2);
      } catch {
        return str;
      }
    } else {
      return msg.value.data as string;
    }
  }, [signDocWrapper.aminoSignDoc.msgs, isADR36WithString]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div className={styleDetailsTab.msgContainer} style={{ flex: "none" }}>
        <MsgRender icon="fas fa-pen-nib" title="Prove account ownership to">
          {origin ?? "Unknown"}
        </MsgRender>
      </div>
      <Label
        for="sign-value"
        className="form-control-label"
        style={{ marginTop: "8px" }}
      >
        Message
      </Label>
      <div
        id="sign-value"
        style={{
          marginBottom: "8px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <pre
          style={{
            flex: 1,
            padding: "20px",
            border: "1px solid #9092B6",
            borderRadius: "8px",
          }}
        >
          {signValue}
        </pre>
      </div>
      <Label for="chain-name" className="form-control-label">
        Requested Network
      </Label>
      <div id="chain-name" style={{ marginBottom: "8px" }}>
        <div>{chainStore.current.chainName}</div>
      </div>
    </div>
  );
});
