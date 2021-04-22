import React, { FunctionComponent } from "react";

import { observer } from "mobx-react-lite";
import { useStore } from "../stores";

import {
  IFeeConfig,
  IGasConfig,
  IMemoConfig,
  SignDocHelper,
} from "@keplr-wallet/hooks";
import { renderAminoMessage } from "./amino";
import { renderDirectMessage } from "./direct";
import { ScrollView, View } from "react-native";
import { Text } from "react-native-elements";
import {
  body3,
  flex1,
  flexDirectionRow,
  h3,
  h6,
  p3,
  subtitle1,
  subtitle2,
} from "../styles";
import Icon from "react-native-vector-icons/Feather";

export const TransactionDetails: FunctionComponent<{
  signDocHelper: SignDocHelper;
  memoConfig: IMemoConfig;
  feeConfig: IFeeConfig;
  gasConfig: IGasConfig;
  disableInputs?: boolean;
}> = observer(
  ({ signDocHelper, memoConfig, feeConfig, gasConfig, disableInputs }) => {
    const { chainStore, priceStore, accountStore } = useStore();

    const mode = signDocHelper.signDocWrapper
      ? signDocHelper.signDocWrapper.mode
      : "none";
    const msgs = signDocHelper.signDocWrapper
      ? signDocHelper.signDocWrapper.mode === "amino"
        ? signDocHelper.signDocWrapper.aminoSignDoc.msgs
        : signDocHelper.signDocWrapper.protoSignDoc.txMsgs
      : [];

    const renderedMsgs = (() => {
      if (mode === "amino") {
        return (msgs as any[]).map((msg, i) => {
          const msgContent = renderAminoMessage(
            accountStore.getAccount(chainStore.current.chainId).msgOpts,
            msg,
            chainStore.current.currencies
          );
          return (
            <React.Fragment key={i.toString()}>
              <Msg
                icon={msgContent.icon}
                title={msgContent.title}
                content={msgContent.content}
              />
            </React.Fragment>
          );
        });
      } else if (mode === "direct") {
        return (msgs as any[]).map((msg, i) => {
          const msgContent = renderDirectMessage(
            msg,
            chainStore.current.currencies
          );
          return (
            <React.Fragment key={i.toString()}>
              <Msg
                icon={msgContent.icon}
                title={msgContent.title}
                content={msgContent.content}
              />
            </React.Fragment>
          );
        });
      } else {
        return null;
      }
    })();

    return (
      <React.Fragment>
        <ScrollView>{renderedMsgs}</ScrollView>
        <View>
          <Text style={subtitle2}>Memo</Text>
          <Text style={subtitle1}>
            {memoConfig.memo ? memoConfig.memo : "(No memo)"}
          </Text>
        </View>
        <View>
          <Text style={subtitle2}>Fee</Text>
          <Text style={subtitle1}>
            {feeConfig.fee.maxDecimals(6).trim(true).toString()}
          </Text>
        </View>
      </React.Fragment>
    );
  }
);

const Msg: FunctionComponent<{
  icon?: string;
  title: string;
  content: string;
}> = ({ icon = "question", title, content }) => {
  return (
    <View style={flexDirectionRow}>
      <View style={p3}>
        <Icon name={icon} size={18} />
      </View>
      <View style={flex1}>
        <Text style={h6}>{title}</Text>
        <Text style={body3}>{content}</Text>
      </View>
    </View>
  );
};
