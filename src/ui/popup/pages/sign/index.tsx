import React, { FunctionComponent, useEffect, useState } from "react";
import { Button } from "../../../components/button";
import {
  ApproveSignMsg,
  GetRequestedMessage,
  RejectSignMsg
} from "../../../../background/keyring";
import { RouteComponentProps } from "react-router";
import { sendMessage } from "../../../../common/message";
import { BACKGROUND_PORT } from "../../../../common/message/constant";

import { HeaderLayout } from "../../layouts/HeaderLayout";

const Buffer = require("buffer/").Buffer;

const approve = (index: string) => {
  const msg = ApproveSignMsg.create(index);
  sendMessage(BACKGROUND_PORT, msg);
};

const reject = (index: string) => {
  const msg = RejectSignMsg.create(index);
  sendMessage(BACKGROUND_PORT, msg);
};

export const SignPage: FunctionComponent<
  RouteComponentProps<{ index: string }>
> = ({ history, match }) => {
  const index = match.params.index;

  const [message, setMessage] = useState("");

  useEffect(() => {
    (async () => {
      const msg = GetRequestedMessage.create(index);
      const result: { messageHex: string } = await sendMessage(
        BACKGROUND_PORT,
        msg
      );

      const message = Buffer.from(result.messageHex, "hex").toString();

      try {
        setMessage(JSON.stringify(JSON.parse(message), undefined, 2));
      } catch (e) {
        setMessage(message);
      }
    })();
  }, [index]);

  return (
    <HeaderLayout
      showChainName
      canChangeChainInfo={false}
      onBackButton={() => {
        history.goBack();
      }}
    >
      <div>
        <pre style={{ height: "300px", overflow: "scroll" }}>{message}</pre>
        <Button onClick={() => approve(index)}>Approve</Button>
        <Button onClick={() => reject(index)}>Reject</Button>
      </div>
    </HeaderLayout>
  );
};
