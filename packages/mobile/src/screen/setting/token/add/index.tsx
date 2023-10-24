import React, {
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {observer} from 'mobx-react-lite';
import {Stack} from '../../../../components/stack';
import {TextInput} from '../../../../components/input';
import {useStore} from '../../../../stores';
import {Box} from '../../../../components/box';
import {autorun} from 'mobx';
import {AppCurrency} from '@keplr-wallet/types';
// import {useInteractionInfo} from '../../../../hooks';
import {useStyle} from '../../../../styles';
import {Column, Columns} from '../../../../components/column';
import {Toggle} from '../../../../components/toggle';
import {FormattedMessage, useIntl} from 'react-intl';
import {Bech32Address} from '@keplr-wallet/cosmos';
// import {ContractAddressBookModal} from '../../../../components/contract-address-book-modal';
import {IconButton} from '../../../../components/icon-button';
import {MenuIcon} from '../../../../components/icon';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {RootStackParamList, StackNavProp} from '../../../../navigation';
import {PageWithScrollView} from '../../../../components/page';
import {ContractAddressBookModal} from '../../components/contract-address-book-modal';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {Text} from 'react-native';
import {Controller, useForm} from 'react-hook-form';
import {Button} from '../../../../components/button';
import {Gutter} from '../../../../components/gutter';

// const Styles = {
//   Container: styled(Stack)`
//     padding: 0 0.75rem;
//   `,
// };

interface FormData {
  contractAddress: string;
  // For the secret20
  viewingKey: string;
}

export const SettingTokenAddScreen: FunctionComponent = observer(() => {
  const {chainStore, accountStore, queriesStore, tokensStore} = useStore();

  const intl = useIntl();
  const navigate = useNavigation<StackNavProp>();
  // const notification = useNotification();
  const route =
    useRoute<RouteProp<RootStackParamList, 'Setting.ManageTokenList.Add'>>();
  const paramChainId = route.params.chainId;
  const contractModalRef = useRef<BottomSheetModal>(null);
  const style = useStyle();

  const {setValue, handleSubmit, control, formState, watch} = useForm<FormData>(
    {
      defaultValues: {
        contractAddress: route.params.contractAddress || '',
        viewingKey: '',
      },
    },
  );

  const supportedChainInfos = useMemo(() => {
    return chainStore.chainInfos.filter(chainInfo => {
      return (
        chainInfo.features?.includes('cosmwasm') ||
        chainInfo.features?.includes('secretwasm')
      );
    });
  }, [chainStore.chainInfos]);
  const [chainId] = useState<string>(() => {
    if (paramChainId) {
      return paramChainId;
    }

    if (supportedChainInfos.length > 0) {
      return supportedChainInfos[1].chainId;
    } else {
      return chainStore.chainInfos[0].chainId;
    }
  });

  // secret20은 서명 페이지로 넘어가야하기 때문에 막아야함...
  const blockRejectAll = useRef(false);

  //TODO interaction작업 후 구현해야함
  // const interactionInfo = useInteractionInfo(() => {
  //   if (!blockRejectAll.current) {
  //     tokensStore.rejectAllSuggestedTokens();
  //   }
  // });

  // useLayoutEffect(() => {
  //   if (interactionInfo.interaction) {
  //     if (tokensStore.waitingSuggestedToken) {
  //       setChainId(tokensStore.waitingSuggestedToken.data.chainId);
  //       setValue(
  //         'contractAddress',
  //         tokensStore.waitingSuggestedToken.data.contractAddress,
  //       );
  //     }
  //   }
  // }, [interactionInfo, setValue, tokensStore.waitingSuggestedToken]);

  useEffect(() => {
    // secret20은 계정에 귀속되기 때문에 추가/삭제 등을 할때 먼저 초기화가 되어있어야만 가능하다.
    // 이를 보장하기 위해서 이 로직이 추가됨...
    const disposal = autorun(() => {
      const account = accountStore.getAccount(chainId);
      if (account.bech32Address === '') {
        account.init();
      }
    });

    return () => {
      if (disposal) {
        disposal();
      }
    };
  }, [accountStore, chainId]);

  const isSecretWasm = chainStore.getChain(chainId).hasFeature('secretwasm');
  const [isOpenSecret20ViewingKey, setIsOpenSecret20ViewingKey] =
    useState(false);

  //TODO dropdown 완성되면 사용해서 드롭다운 구현
  // const items = supportedChainInfos.map(chainInfo => {
  //   return {
  //     key: chainInfo.chainId,
  //     label: chainInfo.chainName,
  //   };
  // });

  const contractAddress = watch('contractAddress').trim();
  const queryContract = (() => {
    if (isSecretWasm) {
      return queriesStore
        .get(chainId)
        .secret.querySecret20ContractInfo.getQueryContract(contractAddress);
    } else {
      return queriesStore
        .get(chainId)
        .cosmwasm.querycw20ContractInfo.getQueryContract(contractAddress);
    }
  })();

  //NOTE queryContract.isFetching을 강제로 observe하기 위해서 작성
  //Controller의 render에 전달된 TextInput내부에서 queryContract.isFetching가 observe되지 않아서 아래 함수를 작성함
  //헤딩 함수로 강제로 observe하면 동작 되므로 일단 이렇게 작성
  (() => {
    queryContract.isFetching;
  })();

  const createViewingKey = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      accountStore
        .getAccount(chainId)
        .secret.createSecret20ViewingKey(
          contractAddress,
          '',
          {},
          {},
          (tx, viewingKey) => {
            if (tx.code != null && tx.code !== 0) {
              reject(new Error(tx.raw_log));
              return;
            }

            if (!viewingKey) {
              reject(
                new Error(intl.formatMessage({id: 'error.viewing-key-null'})),
              );
              return;
            }
            resolve(viewingKey);
          },
        )
        .catch(reject);
    });
  };

  const submit = handleSubmit(async data => {
    console.log('info', queryContract.tokenInfo);
    if (queryContract.tokenInfo) {
      let currency: AppCurrency;

      if (isSecretWasm) {
        let viewingKey = data.viewingKey;

        if (!viewingKey && !isOpenSecret20ViewingKey) {
          try {
            blockRejectAll.current = true;
            viewingKey = await createViewingKey();
          } catch (e) {
            //TODO 토스트 작성해야함
            // notification.show(
            //   'failed',
            //   intl.formatMessage({
            //     id: 'error.failed-to-create-viewing-key',
            //   }),
            //   e.message || e.toString(),
            // );

            await new Promise(resolve => setTimeout(resolve, 2000));

            // window.close();
            return;
          }
        }

        currency = {
          type: 'secret20',
          contractAddress,
          viewingKey,
          coinMinimalDenom: queryContract.tokenInfo.name,
          coinDenom: queryContract.tokenInfo.symbol,
          coinDecimals: queryContract.tokenInfo.decimals,
        };
      } else {
        currency = {
          type: 'cw20',
          contractAddress: contractAddress,
          coinMinimalDenom: queryContract.tokenInfo.name,
          coinDenom: queryContract.tokenInfo.symbol,
          coinDecimals: queryContract.tokenInfo.decimals,
        };
      }
      //TODO interaction작업 후 구현해야함
      // if (interactionInfo.interaction && tokensStore.waitingSuggestedToken) {
      //   await tokensStore.approveSuggestedTokenWithProceedNext(
      //     tokensStore.waitingSuggestedToken.id,
      //     currency,
      //     proceedNext => {
      //       if (!proceedNext) {
      //         if (
      //           interactionInfo.interaction &&
      //           !interactionInfo.interactionInternal
      //         ) {
      //           window.close();
      //         }
      //       }

      //       if (
      //         interactionInfo.interaction &&
      //         !interactionInfo.interactionInternal &&
      //         isSecretWasm
      //       ) {
      //         // TODO: secret20의 경우는 서명 페이지로 페이지 자체가 넘어가기 때문에 proceedNext를 처리할 수가 없다.
      //         //       나중에 뭔가 해결법이 생기면 다시 생각해본다...
      //         window.close();
      //       }
      //     },
      //   );
      // } else {
      await tokensStore.addToken(chainId, currency);
      navigate.reset({routes: [{name: 'Home'}]});
      // }
    }
  });
  return (
    <PageWithScrollView
      backgroundMode={'default'}
      contentContainerStyle={style.flatten(['flex-grow-1'])}>
      <Box paddingX={12} height={'100%'}>
        <Stack gutter={16}>
          {/* TODO dropdown 컴포넌트 이후 작업 */}
          {/* {!interactionInfo.interaction ? (
            <Box width="13rem">
              <Dropdown
                items={items}
                selectedItemKey={chainId}
                onSelect={setChainId}
                allowSearch={true}
              />
            </Box>
          ) : null} */}
          <Controller
            name="contractAddress"
            control={control}
            rules={{
              required: '',
              validate: (value): string | undefined => {
                try {
                  const chainInfo = chainStore.getChain(chainId);
                  Bech32Address.validate(
                    value,
                    chainInfo.bech32Config.bech32PrefixAccAddr,
                  );
                } catch (e) {
                  return e.message || e.toString();
                }
              },
            }}
            render={({field: {value, onChange}}) => (
              <TextInput
                label={intl.formatMessage({
                  id: 'page.setting.token.add.contract-address-label',
                })}
                isLoading={queryContract.isFetching}
                onChangeText={onChange}
                value={value}
                // readOnly={interactionInfo.interaction}
                right={
                  <IconButton
                    hasRipple={true}
                    rippleColor={style.get('color-gray-500').color}
                    underlayColor={style.get('color-gray-500').color}
                    icon={
                      <MenuIcon
                        size={24}
                        color={style.get('color-text-high').color}
                      />
                    }
                    onPress={() => {
                      contractModalRef.current?.present();
                    }}
                    style={style.flatten(['padding-4'])}
                  />
                }
                error={
                  formState.errors.contractAddress?.message ||
                  (queryContract.error?.data as any)?.message
                }
              />
            )}
          />

          <TextInput
            label={intl.formatMessage({
              id: 'page.setting.token.add.name-label',
            })}
            value={queryContract.tokenInfo?.name || '-'}
            disabled
          />
          <TextInput
            label={intl.formatMessage({
              id: 'page.setting.token.add.symbol-label',
            })}
            value={queryContract.tokenInfo?.symbol || '-'}
            disabled
          />
          <TextInput
            label={intl.formatMessage({
              id: 'page.setting.token.add.decimal-label',
            })}
            value={queryContract.tokenInfo?.decimals.toString() || '-'}
            disabled
          />
        </Stack>
        <Column weight={1} />
        {isSecretWasm ? (
          <Stack gutter={12}>
            <Box
              backgroundColor={style.get('color-gray-600').color}
              borderRadius={6}
              padding={16}>
              <Columns sum={1} alignY="center" gutter={4}>
                <Column weight={1}>
                  <Stack>
                    <Text
                      style={style.flatten([
                        'subtitle2',
                        'color-text-high',
                        'color-gray-50',
                      ])}>
                      <FormattedMessage id="page.setting.token.add.viewing-key-info-title" />
                    </Text>
                    <Text style={style.flatten(['body3', 'color-text-middle'])}>
                      <FormattedMessage id="page.setting.token.add.viewing-key-info-paragraph" />
                    </Text>
                  </Stack>
                </Column>

                <Toggle
                  isOpen={isOpenSecret20ViewingKey}
                  setIsOpen={setIsOpenSecret20ViewingKey}
                />
              </Columns>
            </Box>

            {isOpenSecret20ViewingKey ? (
              <Controller
                name="viewingKey"
                control={control}
                rules={{required: ''}}
                render={({field: {value, onChange}}) => (
                  <TextInput
                    label={intl.formatMessage({
                      id: 'page.setting.token.add.viewing-key-label',
                    })}
                    onChangeText={onChange}
                    value={value}
                    error={
                      formState.errors.viewingKey
                        ? formState.errors.viewingKey.message
                        : undefined
                    }
                  />
                )}
              />
            ) : null}
            <Gutter size={16} />
          </Stack>
        ) : null}
        <Button
          color="secondary"
          size="large"
          text={intl.formatMessage({
            id: 'page.setting.token.add.confirm-button',
          })}
          disabled={
            contractAddress.length === 0 ||
            !queryContract.tokenInfo ||
            (isSecretWasm && !accountStore.getAccount(chainId).isReadyToSendTx)
          }
          onPress={submit}
        />
      </Box>
      <ContractAddressBookModal
        modalRef={contractModalRef}
        chainId={chainId}
        onSelect={(address: string) => {
          setValue('contractAddress', address);
          contractModalRef.current?.dismiss();
        }}
      />
    </PageWithScrollView>
  );
});
