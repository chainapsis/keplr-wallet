import React, {FunctionComponent, useEffect, useMemo, useState} from 'react';
import {SignEthereumInteractionStore} from '@keplr-wallet/stores-core';
import {observer} from 'mobx-react-lite';
import {useStore} from '../../stores';
import {FormattedMessage, useIntl} from 'react-intl';
import {useStyle} from '../../styles';
import {
  useAmountConfig,
  useFeeConfig,
  useGasConfig,
  useSenderConfig,
} from '@keplr-wallet/hooks';
import {BaseModalHeader} from '../../components/modal';
import {Column, Columns} from '../../components/column';
import {Text} from 'react-native';
import {Gutter} from '../../components/gutter';
import {Box} from '../../components/box';
import {XAxis} from '../../components/axis';
import {CloseIcon} from '../../components/icon';
import {CodeBracketIcon} from '../../components/icon/code-bracket';
import {registerCardModal} from '../../components/modal/card';
import {SpecialButton} from '../../components/special-button';
import {ScrollView} from '../../components/scroll-view/common-scroll-view';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import {FeeSummary} from './components/fee-summary';
import {EthSignType} from '@keplr-wallet/types';
import {defaultRegistry} from './components/eth-tx/registry';
import {UnsignedTransaction} from '@ethersproject/transactions';
import {CoinPretty, Dec} from '@keplr-wallet/unit';
import {Buffer} from 'buffer/';

export const SignEthereumModal = registerCardModal(
  observer<{
    interactionData: NonNullable<SignEthereumInteractionStore['waitingData']>;
  }>(({interactionData}) => {
    const {chainStore, signEthereumInteractionStore, queriesStore} = useStore();

    const intl = useIntl();
    const style = useStyle();

    const [isViewData, setIsViewData] = useState(false);

    const chainId = interactionData.data.chainId;
    const chainInfo = chainStore.getChain(chainId);
    const signer = interactionData.data.signer;

    const senderConfig = useSenderConfig(chainStore, chainId, signer);
    const gasConfig = useGasConfig(chainStore, chainId);
    const amountConfig = useAmountConfig(
      chainStore,
      queriesStore,
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

    useEffect(() => {
      const data = interactionData.data;
      if (data.signType === EthSignType.TRANSACTION) {
        const unsignedTx: UnsignedTransaction = JSON.parse(
          Buffer.from(interactionData.data.message).toString(),
        );

        const gas =
          typeof unsignedTx.gasLimit === 'string'
            ? parseInt(unsignedTx.gasLimit, 16)
            : 0;
        const gasPrice =
          typeof unsignedTx.maxFeePerGas === 'string'
            ? parseInt(unsignedTx.maxFeePerGas, 16)
            : typeof unsignedTx.gasPrice === 'string'
            ? parseInt(unsignedTx.gasPrice, 16)
            : 0;

        const feeAmount = new Dec(gas).mul(new Dec(gasPrice));
        const feeCurrency = chainInfo.currencies[0];
        const fee = new CoinPretty(feeCurrency, feeAmount);

        feeConfig.setFee(fee);
      }
    }, [chainInfo.currencies, feeConfig, interactionData.data]);

    const isTxSigning =
      interactionData.data.signType === EthSignType.TRANSACTION;

    const signingDataText = useMemo(() => {
      switch (interactionData.data.signType) {
        case EthSignType.MESSAGE:
          return Buffer.from(interactionData.data.message).toString('hex');
        case EthSignType.TRANSACTION:
          return JSON.stringify(
            JSON.parse(Buffer.from(interactionData.data.message).toString()),
            null,
            2,
          );
        case EthSignType.EIP712:
          return JSON.stringify(
            JSON.parse(Buffer.from(interactionData.data.message).toString()),
            null,
            2,
          );
        default:
          return Buffer.from(interactionData.data.message).toString('hex');
      }
    }, [interactionData.data]);

    const approve = async () => {
      try {
        await signEthereumInteractionStore.approveWithProceedNext(
          interactionData.id,
          Buffer.from(signingDataText),
          // TODO: Ledger support
          undefined,
          async () => {
            // noop
          },
          {
            // XXX: 단지 special button의 애니메이션을 보여주기 위해서 delay를 넣음...ㅋ;
            preDelay: 200,
          },
        );
      } catch (e) {
        console.log(e);
      }
    };

    return (
      <Box style={style.flatten(['padding-12', 'padding-top-0'])}>
        <BaseModalHeader
          title={intl.formatMessage({
            id: isTxSigning
              ? 'page.sign.ethereum.tx.title'
              : 'page.sign.ethereum.title',
          })}
          titleStyle={style.flatten(['h3'])}
        />
        <Gutter size={24} />

        <Columns sum={1} alignY="center">
          <Text style={style.flatten(['h5', 'color-label-default'])}>
            <FormattedMessage id="page.sign.ethereum.tx.summary" />
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
            padding={12}
            borderRadius={6}>
            <ScrollView isGestureScrollView={true} persistentScrollbar={true}>
              <Text style={style.flatten(['body3', 'color-text-middle'])}>
                {signingDataText}
              </Text>
            </ScrollView>
          </Box>
        ) : (
          <Box
            padding={12}
            minHeight={128}
            maxHeight={240}
            backgroundColor={style.get('color-gray-500').color}
            borderRadius={6}>
            {
              defaultRegistry.render(
                interactionData.data.chainId,
                JSON.parse(
                  Buffer.from(interactionData.data.message).toString(),
                ) as UnsignedTransaction,
              ).content
            }
          </Box>
        )}

        <Gutter size={60} />
        {interactionData.isInternal && (
          <FeeSummary feeConfig={feeConfig} gasConfig={gasConfig} />
        )}

        <Gutter size={12} />

        <SpecialButton
          size="large"
          text={intl.formatMessage({
            id: 'button.approve',
          })}
          isLoading={signEthereumInteractionStore.isObsoleteInteraction(
            interactionData.id,
          )}
          onPress={approve}
          innerButtonStyle={style.flatten(['width-full'])}
        />

        <Gutter size={24} />
      </Box>
    );
  }),
);

export const ViewDataButton: FunctionComponent<{
  isViewData: boolean;
  setIsViewData: (value: boolean) => void;
}> = ({isViewData, setIsViewData}) => {
  const style = useStyle();

  return (
    <TouchableWithoutFeedback
      onPress={() => {
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
    </TouchableWithoutFeedback>
  );
};
