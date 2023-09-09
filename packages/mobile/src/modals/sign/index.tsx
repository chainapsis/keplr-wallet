import React, { FunctionComponent, useEffect, useState } from "react";
import { registerModal } from "../base";
import { CardModal } from "../card";
import { ScrollView, Text, View } from "react-native";
import { useStyle } from "../../styles";
import { useStore } from "../../stores";
import { MemoInput } from "../../components/input";
import {
  useFeeConfig,
  useMemoConfig,
  useSignDocAmountConfig,
  useSignDocHelper,
  useZeroAllowedGasConfig,
} from "@keplr-wallet/hooks";
import { Button } from "../../components/button";
import { Msg as AminoMsg } from "@keplr-wallet/types";
import { Msg } from "./msg";
import { observer } from "mobx-react-lite";
import { useUnmount } from "../../hooks";
import { FeeInSign } from "./fee";
import { WCMessageRequester } from "../../stores/wallet-connect/msg-requester";
import { WCAppLogoAndName } from "../../components/wallet-connect";
import { renderAminoMessage } from "./amino";
import { renderDirectMessage } from "./direct";
import {
  AnyWithUnpacked,
  defaultProtoCodec,
  UnknownMessage,
} from "@keplr-wallet/cosmos";
import { unescapeHTML } from "@keplr-wallet/common";
import { WCV2MessageRequester } from "../../stores/wallet-connect-v2/msg-requester";
import { MsgGrant } from "@keplr-wallet/proto-types/cosmos/authz/v1beta1/tx";
import { GenericAuthorization } from "@keplr-wallet/proto-types/cosmos/authz/v1beta1/authz";

export const SignModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
}> = registerModal(
  observer(() => {
    const {
      chainStore,
      accountStore,
      queriesStore,
      walletConnectStore,
      walletConnectV2Store,
      signInteractionStore,
    } = useStore();
    useUnmount(() => {
      signInteractionStore.rejectAll();
    });

    // Check that the request is from the wallet connect.
    // If this is undefiend, the request is not from the wallet connect.
    const [wcMetadata, setWCMetadata] = useState<
      { name?: string; url?: string; icons?: string[] } | undefined
    >();

    const style = useStyle();

    const [signer, setSigner] = useState("");

    const [chainId, setChainId] = useState(chainStore.current.chainId);

    // There are services that sometimes use invalid tx to sign arbitrary data on the sign page.
    // In this case, there is no obligation to deal with it, but 0 gas is favorably allowed.
    const gasConfig = useZeroAllowedGasConfig(chainStore, chainId, 0);
    const amountConfig = useSignDocAmountConfig(
      chainStore,
      accountStore,
      chainId,
      signer
    );
    const feeConfig = useFeeConfig(
      chainStore,
      queriesStore,
      chainId,
      signer,
      amountConfig,
      gasConfig
    );
    const memoConfig = useMemoConfig(chainStore, chainId);

    const signDocWapper = signInteractionStore.waitingData?.data.signDocWrapper;
    const signDocHelper = useSignDocHelper(feeConfig, memoConfig);
    amountConfig.setSignDocHelper(signDocHelper);

    const [isInternal, setIsInternal] = useState(false);

    useEffect(() => {
      if (!isInternal) {
        try {
          const msgs = signDocHelper.signDocWrapper
            ? signDocHelper.signDocWrapper.mode === "amino"
              ? signDocHelper.signDocWrapper.aminoSignDoc.msgs
              : signDocHelper.signDocWrapper.protoSignDoc.txMsgs
            : [];

          for (const msg of msgs) {
            const anyMsg = msg as any;
            if (
              anyMsg.type == null &&
              anyMsg.grant &&
              anyMsg.grant.authorization
            ) {
              // cosmos-sdk has bug that amino codec is not applied to authorization properly.
              // This is the workaround for this bug.
              if (anyMsg.grant.authorization.msg) {
                const innerType = anyMsg.grant.authorization.msg;
                if (
                  innerType === "/cosmos.bank.v1beta1.MsgSend" ||
                  innerType === "/cosmos.bank.v1beta1.MsgMultiSend" ||
                  innerType === "/ibc.applications.transfer.v1.MsgTransfer"
                ) {
                  signInteractionStore.rejectAll();
                  return;
                }
              } else if (anyMsg.grant.authorization.spend_limit) {
                // SendAuthorization의 경우 spend_limit를 가진다.
                // omit 되지 않도록 옵션이 설정되어있기 때문에 비어있더라도 빈 배열을 가지고 있어서 이렇게 확인이 가능하다.
                // 근데 사실 다른 authorization도 spend_limit를 가질 수 있으므로 이건 좀 위험한 방법이다.
                // 근데 어차피 버그 버전을 위한거라서 그냥 이렇게 해도 될듯.
                signInteractionStore.rejectAll();
                return;
              }
            } else if ("type" in msg) {
              if (msg.type === "cosmos-sdk/MsgGrant") {
                if (
                  msg.value.grant.authorization.type ===
                  "cosmos-sdk/GenericAuthorization"
                ) {
                  const innerType = msg.value.grant.authorization.value.msg;
                  if (
                    innerType === "/cosmos.bank.v1beta1.MsgSend" ||
                    innerType === "/cosmos.bank.v1beta1.MsgMultiSend" ||
                    innerType === "/ibc.applications.transfer.v1.MsgTransfer"
                  ) {
                    signInteractionStore.rejectAll();
                    return;
                  }
                } else if (
                  msg.value.grant.authorization.type ===
                  "cosmos-sdk/SendAuthorization"
                ) {
                  signInteractionStore.rejectAll();
                  return;
                }
              }
            } else if ("unpacked" in msg) {
              if (msg.typeUrl === "/cosmos.authz.v1beta1.MsgGrant") {
                const grantMsg = msg.unpacked as MsgGrant;
                if (grantMsg.grant && grantMsg.grant.authorization) {
                  if (
                    grantMsg.grant.authorization.typeUrl ===
                    "/cosmos.authz.v1beta1.GenericAuthorization"
                  ) {
                    // XXX: defaultProtoCodec가 msgs를 rendering할때 사용되었다는 엄밀한 보장은 없다.
                    //      근데 로직상 ProtoSignDocDecoder가 defaultProtoCodec가 아닌 다른 codec을 쓰도록 만들 경우가 사실 없기 때문에
                    //      일단 이렇게 처리하고 넘어간다.
                    const unpacked = defaultProtoCodec.unpackAny(
                      grantMsg.grant.authorization
                    );
                    if (!(unpacked instanceof UnknownMessage)) {
                      const genericAuth = GenericAuthorization.decode(
                        unpacked.value
                      );

                      if (
                        genericAuth.msg === "/cosmos.bank.v1beta1.MsgSend" ||
                        genericAuth.msg ===
                          "/cosmos.bank.v1beta1.MsgMultiSend" ||
                        genericAuth.msg ===
                          "/ibc.applications.transfer.v1.MsgTransfer"
                      ) {
                        signInteractionStore.rejectAll();
                        return;
                      }
                    }
                  } else if (
                    grantMsg.grant.authorization.typeUrl ===
                    "/cosmos.bank.v1beta1.SendAuthorization"
                  ) {
                    signInteractionStore.rejectAll();
                    return;
                  }
                }
              }
            }
          }
        } catch (e) {
          console.log("Failed to check during authz grant send check", e);
        }
      }
    }, [isInternal, signDocHelper.signDocWrapper, signInteractionStore]);

    useEffect(() => {
      if (signInteractionStore.waitingData) {
        const data = signInteractionStore.waitingData;
        setIsInternal(data.isInternal);
        signDocHelper.setSignDocWrapper(data.data.signDocWrapper);
        setChainId(data.data.signDocWrapper.chainId);
        gasConfig.setGas(data.data.signDocWrapper.gas);
        let memo = data.data.signDocWrapper.memo;
        if (data.data.signDocWrapper.mode === "amino") {
          // For amino-json sign doc, the memo is escaped by default behavior of golang's json marshaller.
          // For normal users, show the escaped characters with unescaped form.
          // Make sure that the actual sign doc's memo should be escaped.
          // In this logic, memo should be escaped from account store or background's request signing function.
          memo = unescapeHTML(memo);
        }
        memoConfig.setMemo(memo);
        if (
          data.data.signOptions.preferNoSetFee &&
          data.data.signDocWrapper.fees[0]
        ) {
          feeConfig.setManualFee(data.data.signDocWrapper.fees[0]);
        } else {
          feeConfig.setFeeType("average");
        }
        setSigner(data.data.signer);

        if (
          data.data.msgOrigin &&
          WCMessageRequester.isVirtualSessionURL(data.data.msgOrigin)
        ) {
          const sessionId = WCMessageRequester.getSessionIdFromVirtualURL(
            data.data.msgOrigin
          );
          setWCMetadata(
            walletConnectStore.getSession(sessionId)?.peerMeta || undefined
          );
        } else {
          setWCMetadata(undefined);
        }

        if (
          data.data.msgOrigin &&
          WCV2MessageRequester.isVirtualURL(data.data.msgOrigin)
        ) {
          const id = WCV2MessageRequester.getIdFromVirtualURL(
            data.data.msgOrigin
          );
          walletConnectV2Store
            .getSessionMetadata(id)
            .then((r) => setWCMetadata(r));
        } else {
          setWCMetadata(undefined);
        }
      }
    }, [
      feeConfig,
      gasConfig,
      memoConfig,
      signDocHelper,
      signInteractionStore.waitingData,
      walletConnectStore,
      walletConnectV2Store,
    ]);

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
        return (msgs as readonly AminoMsg[]).map((msg, i) => {
          const account = accountStore.getAccount(chainId);
          const chainInfo = chainStore.getChain(chainId);
          const { title, content, scrollViewHorizontal } = renderAminoMessage(
            account,
            msg,
            chainInfo.currencies
          );

          return (
            <View key={i.toString()}>
              <Msg title={title}>
                {scrollViewHorizontal ? (
                  <ScrollView
                    horizontal={true}
                    indicatorStyle={style.theme === "dark" ? "white" : "black"}
                  >
                    <Text style={style.flatten(["body3", "color-text-low"])}>
                      {content}
                    </Text>
                  </ScrollView>
                ) : (
                  <Text style={style.flatten(["body3", "color-text-low"])}>
                    {content}
                  </Text>
                )}
              </Msg>
              {msgs.length - 1 !== i ? (
                <View
                  style={style.flatten([
                    "height-1",
                    "background-color-gray-50",
                    "dark:background-color-platinum-400",
                    "margin-x-16",
                  ])}
                />
              ) : null}
            </View>
          );
        });
      } else if (mode === "direct") {
        return (msgs as AnyWithUnpacked[]).map((msg, i) => {
          const chainInfo = chainStore.getChain(chainId);
          const { title, content } = renderDirectMessage(
            msg,
            chainInfo.currencies
          );

          return (
            <View key={i.toString()}>
              <Msg title={title}>
                <Text style={style.flatten(["body3", "color-text-low"])}>
                  {content}
                </Text>
              </Msg>
              {msgs.length - 1 !== i ? (
                <View
                  style={style.flatten([
                    "height-1",
                    "background-color-gray-50",
                    "dark:background-color-platinum-400",
                    "margin-x-16",
                  ])}
                />
              ) : null}
            </View>
          );
        });
      } else {
        return null;
      }
    })();

    return (
      <CardModal title="Confirm Transaction">
        {wcMetadata ? (
          <WCAppLogoAndName
            containerStyle={style.flatten(["margin-y-14"])}
            peerMeta={wcMetadata}
          />
        ) : null}
        <View style={style.flatten(["margin-bottom-16"])}>
          <Text style={style.flatten(["margin-bottom-3"])}>
            <Text style={style.flatten(["subtitle3", "color-blue-400"])}>
              {`${msgs.length.toString()} `}
            </Text>
            <Text style={style.flatten(["subtitle3", "color-text-middle"])}>
              Messages
            </Text>
          </Text>
          <View
            style={style.flatten([
              "border-radius-8",
              "border-width-1",
              "border-color-gray-50",
              "dark:border-color-platinum-400",
              "overflow-hidden",
            ])}
          >
            <ScrollView
              style={style.flatten([
                "max-height-214",
                "background-color-white",
                "dark:background-color-platinum-500",
              ])}
              persistentScrollbar={true}
              indicatorStyle={style.theme === "dark" ? "white" : "black"}
            >
              {renderedMsgs}
            </ScrollView>
          </View>
        </View>
        <MemoInput label="Memo" memoConfig={memoConfig} />
        <FeeInSign
          feeConfig={feeConfig}
          gasConfig={gasConfig}
          signOptions={signInteractionStore.waitingData?.data.signOptions}
          isInternal={isInternal}
        />
        <Button
          text="Approve"
          size="large"
          disabled={
            signDocWapper == null ||
            signDocHelper.signDocWrapper == null ||
            memoConfig.error != null ||
            feeConfig.error != null
          }
          loading={signInteractionStore.isLoading}
          onPress={async () => {
            try {
              if (signDocHelper.signDocWrapper) {
                await signInteractionStore.approveAndWaitEnd(
                  signDocHelper.signDocWrapper
                );
              }
            } catch (error) {
              console.log(error);
            }
          }}
        />
      </CardModal>
    );
  }),
  {
    disableSafeArea: true,
    blurBackdropOnIOS: true,
  }
);
