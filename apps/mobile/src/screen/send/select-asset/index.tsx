import {observer} from 'mobx-react-lite';
import React, {FunctionComponent, useMemo, useState} from 'react';
import {useStyle} from '../../../styles';
import {useStore} from '../../../stores';
import {Dec} from '@keplr-wallet/unit';
import {TokenItem, ViewToken} from '../../../components/token-view';
import {SearchIcon} from '../../../components/icon';
import {TextInput} from '../../../components/input';
import {Gutter} from '../../../components/gutter';
import {Column, Columns} from '../../../components/column';
import {Text} from 'react-native';
import {Checkbox} from '../../../components/checkbox';
import {
  RouteProp,
  StackActions,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {FormattedMessage, useIntl} from 'react-intl';
import {
  BoundaryScrollView,
  BoundaryScrollViewBoundary,
} from '../../../components/boundary-scroll-view';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Box} from '../../../components/box';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import {EmptyView, EmptyViewText} from '../../../components/empty-view';
import {RootStackParamList, StackNavProp} from '../../../navigation.tsx';

export const SendSelectAssetScreen: FunctionComponent = observer(() => {
  const style = useStyle();
  const navigation = useNavigation<StackNavProp>();
  const intl = useIntl();
  const route = useRoute<RouteProp<RootStackParamList, 'Send.SelectAsset'>>();
  const paramIsIBCSwap = route.params?.isIBCSwap;

  const {hugeQueriesStore, skipQueriesStore} = useStore();

  const [search, setSearch] = useState('');
  const [hideIBCToken, setHideIBCToken] = useState(false);

  const tokens = hugeQueriesStore.getAllBalances(!hideIBCToken);

  const _filteredTokens = useMemo(() => {
    const zeroDec = new Dec(0);
    const newTokens = tokens.filter(token => {
      return token.token.toDec().gt(zeroDec);
    });

    const trimSearch = search.trim();

    if (!trimSearch) {
      return newTokens;
    }

    return newTokens.filter(token => {
      return (
        token.chainInfo.chainName
          .toLowerCase()
          .includes(trimSearch.toLowerCase()) ||
        token.token.currency.coinDenom
          .toLowerCase()
          .includes(trimSearch.toLowerCase())
      );
    });
  }, [search, tokens]);

  const filteredTokens = _filteredTokens.filter(token => {
    if (paramIsIBCSwap) {
      // skipQueriesStore.queryIBCSwap.isSwappableCurrency는 useMemo 안에 들어가면 observation이 안되서 따로 빼야한다...
      return skipQueriesStore.queryIBCSwap.isSwappableCurrency(
        token.chainInfo.chainId,
        token.token.currency,
      );
    }

    return true;
  });

  const safeAreaInsets = useSafeAreaInsets();

  return (
    <Box
      style={{
        flex: 1,
      }}>
      <Box paddingX={12}>
        <TextInput
          left={color => <SearchIcon size={20} color={color} />}
          value={search}
          placeholder={intl.formatMessage({
            id: 'page.send.select-asset.search-placeholder',
          })}
          onChange={e => {
            e.preventDefault();

            setSearch(e.nativeEvent.text);
          }}
        />

        <Gutter size={10} />

        <TouchableWithoutFeedback
          onPress={() => setHideIBCToken(!hideIBCToken)}>
          <Columns sum={1} gutter={4}>
            <Column weight={1} />

            <Text
              style={style.flatten([
                hideIBCToken ? 'color-gray-200' : 'color-gray-300',
                'body2',
              ])}>
              <FormattedMessage id="page.send.select-asset.hide-ibc-token" />
            </Text>

            <Checkbox
              size="small"
              checked={hideIBCToken}
              onPress={() => setHideIBCToken(!hideIBCToken)}
            />
          </Columns>
        </TouchableWithoutFeedback>

        <Gutter size={12} />
      </Box>

      {filteredTokens.length ? (
        <BoundaryScrollView
          contentContainerStyle={{
            ...style.flatten(['flex-grow-1', 'padding-x-12']),
            paddingBottom: safeAreaInsets.bottom,
          }}>
          <BoundaryScrollViewBoundary
            itemHeight={71.3}
            gap={8}
            data={filteredTokens}
            keyExtractor={(token: ViewToken) =>
              `${token.chainInfo.chainId}-${token.token.currency.coinMinimalDenom}`
            }
            renderItem={(token: ViewToken) => {
              return (
                <TokenItem
                  viewToken={token}
                  onClick={() => {
                    if (paramIsIBCSwap) {
                      navigation.navigate({
                        name: 'Swap',
                        params: {
                          ...route.params,
                          chainId: token.chainInfo.chainId,
                          coinMinimalDenom:
                            token.token.currency.coinMinimalDenom,
                        },
                        merge: true,
                      });
                    } else {
                      navigation.dispatch({
                        ...StackActions.replace('Send', {
                          chainId: token.chainInfo.chainId,
                          coinMinimalDenom:
                            token.token.currency.coinMinimalDenom,
                        }),
                      });
                    }
                  }}
                />
              );
            }}
          />
        </BoundaryScrollView>
      ) : (
        <React.Fragment>
          <Gutter size={150} />
          <EmptyView>
            <Box alignX="center">
              <EmptyViewText
                text={intl.formatMessage({
                  id: 'page.send.select-asset.empty-text',
                })}
              />
            </Box>
          </EmptyView>
        </React.Fragment>
      )}
    </Box>
  );
});
