import React, {FunctionComponent, useEffect, useState} from 'react';
import {SignInteractionStore} from '@keplr-wallet/stores-core';
import {observer} from 'mobx-react-lite';
import {useStore} from '../../stores';
import {FormattedMessage, useIntl} from 'react-intl';
import {useStyle} from '../../styles';
import {
  useFeeConfig,
  useMemoConfig,
  useSenderConfig,
  useSignDocAmountConfig,
  useSignDocHelper,
  useTxConfigsValidate,
  useZeroAllowedGasConfig,
} from '@keplr-wallet/hooks';
import {unescapeHTML} from '@keplr-wallet/common';
import {CoinPretty, Int} from '@keplr-wallet/unit';
import {MsgGrant} from '@keplr-wallet/proto-types/cosmos/authz/v1beta1/tx';
import {defaultProtoCodec} from '@keplr-wallet/cosmos';
import {GenericAuthorization} from '@keplr-wallet/stores/build/query/cosmos/authz/types';
import {useUnmount} from '../../hooks/use-unmount';
import {BaseModalHeader} from '../../components/modal';
import {Column, Columns} from '../../components/column';
import {Text} from 'react-native';
import {Gutter} from '../../components/gutter';
import {Box} from '../../components/box';
import {FeeControl} from '../../components/input/fee-control';
import {Button} from '../../components/button';
import {XAxis} from '../../components/axis';
import {CloseIcon} from '../../components/icon';
import {CodeBracketIcon} from '../../components/icon/code-bracket';
import {MemoInput} from '../../components/input/memo-input';
import {defaultRegistry} from './message-registry';
import {MessageItem} from './message-item';
import {ScrollView, FlatList} from 'react-native-gesture-handler';
import {GuideBox} from '../../components/guide-box';
import {Checkbox} from '../../components/checkbox';
import {registerCardModal} from '../../components/modal/card';

export const SignModal = registerCardModal(
  observer<{
    interactionData: NonNullable<SignInteractionStore['waitingData']>;
  }>(({interactionData}) => {
    const {chainStore, signInteractionStore, queriesStore} = useStore();

    const intl = useIntl();
    const style = useStyle();

    const chainId = interactionData.data.chainId;
    const signer = interactionData.data.signer;
    const senderConfig = useSenderConfig(chainStore, chainId, signer);
    const gasConfig = useZeroAllowedGasConfig(chainStore, chainId, 0);
    const amountConfig = useSignDocAmountConfig(
      chainStore,
      chainId,
      senderConfig,
    );
    const feeConfig = useFeeConfig(
      chainStore,
      queriesStore,
      chainId,
      senderConfig,
      amountConfig,
      gasConfig,
    );
    const memoConfig = useMemoConfig(chainStore, chainId);
    const signDocHelper = useSignDocHelper(feeConfig, memoConfig);
    amountConfig.setSignDocHelper(signDocHelper);

    const [isViewData, setIsViewData] = useState(false);

    const msgs = signDocHelper.signDocWrapper
      ? signDocHelper.signDocWrapper.mode === 'amino'
        ? signDocHelper.signDocWrapper.aminoSignDoc.msgs
        : signDocHelper.signDocWrapper.protoSignDoc.txMsgs
      : [];

    useEffect(() => {
      const data = interactionData.data;

      if (data.chainId !== data.signDocWrapper.chainId) {
        // Validate the requested chain id and the chain id in the sign doc are same.
        throw new Error('Chain id unmatched');
      }

      signDocHelper.setSignDocWrapper(data.signDocWrapper);
      gasConfig.setValue(data.signDocWrapper.gas);

      let memo = data.signDocWrapper.memo;
      if (data.signDocWrapper.mode === 'amino') {
        // For amino-json sign doc, the memo is escaped by default behavior of golang's json marshaller.
        // For normal users, show the escaped characters with unescaped form.
        // Make sure that the actual sign doc's memo should be escaped.
        // In this logic, memo should be escaped from account store or background's request signing function.
        memo = unescapeHTML(memo);
      }
      memoConfig.setValue(memo);

      if (
        data.signOptions.preferNoSetFee ||
        // 자동으로 fee를 다뤄줄 수 있는건 fee가 하나인 경우이다.
        // fee가 여러개인 경우는 일반적인 경우가 아니기 때문에
        // 케플러에서 처리해줄 수 없다. 그러므로 옵션을 무시하고 fee 설정을 각 웹사이트에 맡긴다.
        data.signDocWrapper.fees.length >= 2
      ) {
        feeConfig.setFee(
          data.signDocWrapper.fees.map(fee => {
            const currency = chainStore
              .getChain(data.chainId)
              .forceFindCurrency(fee.denom);
            return new CoinPretty(currency, new Int(fee.amount));
          }),
        );
      }

      amountConfig.setDisableBalanceCheck(
        !!data.signOptions.disableBalanceCheck,
      );
      feeConfig.setDisableBalanceCheck(!!data.signOptions.disableBalanceCheck);

      // We can't check the fee balance if the payer is not the signer.
      if (
        data.signDocWrapper.payer &&
        data.signDocWrapper.payer !== data.signer
      ) {
        feeConfig.setDisableBalanceCheck(true);
      }
      // We can't check the fee balance if the granter is not the signer.
      if (
        data.signDocWrapper.granter &&
        data.signDocWrapper.granter !== data.signer
      ) {
        feeConfig.setDisableBalanceCheck(true);
      }
    }, [
      amountConfig,
      chainStore,
      feeConfig,
      gasConfig,
      interactionData.data,
      memoConfig,
      signDocHelper,
    ]);

    const [isSendAuthzGrant, setIsSendAuthzGrant] = useState(false);
    const [isSendAuthzGrantChecked, setIsSendAuthzGrantChecked] =
      useState(false);

    useEffect(() => {
      try {
        if (
          // 라이크코인의 요청으로 일단 얘는 스킵...
          interactionData.data.origin === 'https://liker.land' ||
          interactionData.data.origin === 'https://app.like.co'
        ) {
          return;
        }

        const msgs = signDocHelper.signDocWrapper
          ? signDocHelper.signDocWrapper.mode === 'amino'
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
                innerType === '/cosmos.bank.v1beta1.MsgSend' ||
                innerType === '/cosmos.bank.v1beta1.MsgMultiSend' ||
                innerType === '/ibc.applications.transfer.v1.MsgTransfer'
              ) {
                setIsSendAuthzGrant(true);
                return;
              }
            } else if (anyMsg.grant.authorization.spend_limit) {
              // SendAuthorization의 경우 spend_limit를 가진다.
              // omit 되지 않도록 옵션이 설정되어있기 때문에 비어있더라도 빈 배열을 가지고 있어서 이렇게 확인이 가능하다.
              // 근데 사실 다른 authorization도 spend_limit를 가질 수 있으므로 이건 좀 위험한 방법이다.
              // 근데 어차피 버그 버전을 위한거라서 그냥 이렇게 해도 될듯.
              setIsSendAuthzGrant(true);
              return;
            }
          } else if ('type' in msg) {
            if (msg.type === 'cosmos-sdk/MsgGrant') {
              if (
                msg.value.grant.authorization.type ===
                'cosmos-sdk/GenericAuthorization'
              ) {
                const innerType = msg.value.grant.authorization.value.msg;
                if (
                  innerType === '/cosmos.bank.v1beta1.MsgSend' ||
                  innerType === '/cosmos.bank.v1beta1.MsgMultiSend' ||
                  innerType === '/ibc.applications.transfer.v1.MsgTransfer'
                ) {
                  setIsSendAuthzGrant(true);
                  return;
                }
              } else if (
                msg.value.grant.authorization.type ===
                'cosmos-sdk/SendAuthorization'
              ) {
                setIsSendAuthzGrant(true);
                return;
              }
            }
          } else if ('unpacked' in msg) {
            if (msg.typeUrl === '/cosmos.authz.v1beta1.MsgGrant') {
              const grantMsg = msg.unpacked as MsgGrant;
              if (grantMsg.grant && grantMsg.grant.authorization) {
                if (
                  grantMsg.grant.authorization.typeUrl ===
                  '/cosmos.authz.v1beta1.GenericAuthorization'
                ) {
                  // XXX: defaultProtoCodec가 msgs를 rendering할때 사용되었다는 엄밀한 보장은 없다.
                  //      근데 로직상 ProtoSignDocDecoder가 defaultProtoCodec가 아닌 다른 codec을 쓰도록 만들 경우가 사실 없기 때문에
                  //      일단 이렇게 처리하고 넘어간다.
                  const factory = defaultProtoCodec.unpackAnyFactory(
                    grantMsg.grant.authorization.typeUrl,
                  );
                  if (factory) {
                    const genericAuth = factory.decode(
                      grantMsg.grant.authorization.value,
                    ) as GenericAuthorization;

                    if (
                      genericAuth.msg === '/cosmos.bank.v1beta1.MsgSend' ||
                      genericAuth.msg === '/cosmos.bank.v1beta1.MsgMultiSend' ||
                      genericAuth.msg ===
                        '/ibc.applications.transfer.v1.MsgTransfer'
                    ) {
                      setIsSendAuthzGrant(true);
                      return;
                    }
                  }
                } else if (
                  grantMsg.grant.authorization.typeUrl ===
                  '/cosmos.bank.v1beta1.SendAuthorization'
                ) {
                  setIsSendAuthzGrant(true);
                  return;
                }
              }
            }
          }
        }
      } catch (e) {
        console.log('Failed to check during authz grant send check', e);
      }

      setIsSendAuthzGrant(false);
    }, [interactionData.data.origin, signDocHelper.signDocWrapper]);

    const txConfigsValidate = useTxConfigsValidate({
      senderConfig,
      gasConfig,
      amountConfig,
      feeConfig,
      memoConfig,
    });

    const preferNoSetFee = (() => {
      // 자동으로 fee를 다뤄줄 수 있는건 fee가 하나인 경우이다.
      // fee가 여러개인 경우는 일반적인 경우가 아니기 때문에
      // 케플러에서 처리해줄 수 없다. 그러므로 옵션을 무시하고 fee 설정을 각 웹사이트에 맡긴다.
      if (interactionData.data.signDocWrapper.fees.length >= 2) {
        return true;
      }

      return interactionData.data.signOptions.preferNoSetFee;
    })();

    const preferNoSetMemo = interactionData.data.signOptions.preferNoSetMemo;

    const [unmountPromise] = useState(() => {
      let resolver: () => void;
      const promise = new Promise<void>(resolve => {
        resolver = resolve;
      });

      return {
        promise,
        resolver: resolver!,
      };
    });

    useUnmount(() => {
      unmountPromise.resolver();
    });

    const buttonDisabled =
      txConfigsValidate.interactionBlocked || !signDocHelper.signDocWrapper;

    const approve = async () => {
      if (signDocHelper.signDocWrapper) {
        try {
          await signInteractionStore.approveWithProceedNext(
            interactionData.id,
            signDocHelper.signDocWrapper,
            undefined,
            () => {
              console.log('afterFn');
            },
            {},
          );
        } catch (e) {
          console.log(e);
        }
      }
    };

    return (
      <Box style={style.flatten(['padding-12', 'padding-top-0'])}>
        <BaseModalHeader
          title={intl.formatMessage({id: 'page.sign.cosmos.tx.title'})}
          titleStyle={style.flatten(['h3'])}
        />
        <Gutter size={24} />

        <Columns sum={1} alignY="center">
          <Text style={style.flatten(['h5', 'color-blue-400'])}>
            {msgs.length}
          </Text>

          <Gutter size={4} />

          <Text style={style.flatten(['h5', 'color-label-default'])}>
            <FormattedMessage id="page.sign.cosmos.tx.messages" />
          </Text>

          <Column weight={1} />

          <ViewDataButton
            isViewData={isViewData}
            setIsViewData={setIsViewData}
          />
        </Columns>

        <Gutter size={8} />

        {isViewData ? (
          <Box
            maxHeight={128}
            backgroundColor={style.get('color-gray-500').color}
            padding={16}
            borderRadius={6}>
            <ScrollView>
              <Text style={style.flatten(['body3', 'color-text-middle'])}>
                {JSON.stringify(signDocHelper.signDocJson, null, 2)}
              </Text>
            </ScrollView>
          </Box>
        ) : (
          <Box
            maxHeight={240}
            backgroundColor={style.get('color-gray-500').color}
            borderRadius={6}>
            <FlatList
              data={[...msgs]}
              renderItem={({item, index}) => {
                const r = defaultRegistry.render(
                  chainId,
                  // XXX: defaultProtoCodec가 msgs를 rendering할때 사용되었다는 엄밀한 보장은 없다.
                  //      근데 로직상 ProtoSignDocDecoder가 defaultProtoCodec가 아닌 다른 codec을 쓰도록 만들 경우가 사실 없기 때문에
                  //      일단 이렇게 처리하고 넘어간다.
                  defaultProtoCodec,
                  item,
                );

                return (
                  <MessageItem
                    key={index}
                    icon={r.icon}
                    title={r.title}
                    content={r.content}
                  />
                );
              }}
              ItemSeparatorComponent={Divider}
            />
          </Box>
        )}

        <Gutter size={16} />

        {preferNoSetMemo ? (
          <ReadonlyMemo memo={memoConfig.memo} />
        ) : (
          <MemoInput memoConfig={memoConfig} />
        )}

        <FeeControl
          feeConfig={feeConfig}
          senderConfig={senderConfig}
          gasConfig={gasConfig}
          disableAutomaticFeeSet={preferNoSetFee}
        />

        {isSendAuthzGrant ? (
          <React.Fragment>
            <GuideBox
              color="warning"
              title={intl.formatMessage({
                id: 'page.sign.cosmos.tx.authz-send-grant.warning-title',
              })}
              titleRight={
                <Box>
                  <Checkbox
                    checked={isSendAuthzGrantChecked}
                    onPress={(_, checked) => {
                      setIsSendAuthzGrantChecked(checked);
                    }}
                  />
                </Box>
              }
            />

            <Gutter size={16} />
          </React.Fragment>
        ) : null}

        <Button
          size="large"
          text="Approve"
          onPress={approve}
          disabled={buttonDisabled}
        />

        <Gutter size={24} />
      </Box>
    );
  }),
);

const Divider = () => {
  const style = useStyle();

  return (
    <Box
      height={1}
      marginX={16}
      backgroundColor={style.get('color-gray-400').color}
    />
  );
};

export const ViewDataButton: FunctionComponent<{
  isViewData: boolean;
  setIsViewData: (value: boolean) => void;
}> = ({isViewData, setIsViewData}) => {
  const style = useStyle();

  return (
    <Box
      onClick={() => {
        setIsViewData(!isViewData);
      }}>
      <XAxis alignY="center">
        <Text style={style.flatten(['text-button2', 'color-label-default'])}>
          <FormattedMessage id="page.sign.cosmos.tx.view-data-button" />
        </Text>

        <Gutter size={4} />

        {isViewData ? (
          <CloseIcon size={12} color={style.get('color-gray-100').color} />
        ) : (
          <CodeBracketIcon
            size={12}
            color={style.get('color-gray-100').color}
          />
        )}
      </XAxis>
    </Box>
  );
};

export const ReadonlyMemo: FunctionComponent<{
  memo: string;
}> = ({memo}) => {
  const style = useStyle();

  return (
    <Box
      backgroundColor={style.get('color-gray-500').color}
      borderRadius={6}
      padding={16}>
      <XAxis alignY="center">
        <Text style={style.flatten(['color-text-middle', 'subtitle3'])}>
          Memo
        </Text>
        <Text
          style={{
            flex: 1,
            color: memo
              ? style.get('color-white').color
              : style.get('color-gray-300').color,
            textAlign: 'right',
          }}>
          {memo || (
            <FormattedMessage id="page.sign.cosmos.tx.readonly-memo.empty" />
          )}
        </Text>
      </XAxis>
    </Box>
  );
};
