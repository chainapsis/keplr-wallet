import {observer} from 'mobx-react-lite';
import React, {FunctionComponent, useMemo, useState} from 'react';
import {useStyle} from '../../../styles';
import {useStore} from '../../../stores';
import {Dec} from '@keplr-wallet/unit';
import {TokenItem} from '../../../components/token-view';
import {SearchIcon} from '../../../components/icon';
import {TextInput} from '../../../components/input';
import {Gutter} from '../../../components/gutter';
import {Column, Columns} from '../../../components/column';
import {Text} from 'react-native';
import {Checkbox} from '../../../components/checkbox';
import {StackActions, useNavigation} from '@react-navigation/native';
import {FormattedMessage, useIntl} from 'react-intl';
import {
  BoundaryScrollView,
  BoundaryScrollViewBoundary,
} from '../../../components/boundary-scroll-view';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Box} from '../../../components/box';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import {EmptyView, EmptyViewText} from '../../../components/empty-view';

export const SendSelectAssetScreen: FunctionComponent = observer(() => {
  const style = useStyle();
  const navigation = useNavigation();
  const intl = useIntl();

  const {hugeQueriesStore} = useStore();

  const [search, setSearch] = useState('');
  const [hideIBCToken, setHideIBCToken] = useState(false);

  const tokens = hugeQueriesStore.getAllBalances(!hideIBCToken);

  const filteredTokens = useMemo(() => {
    const zeroDec = new Dec(0);
    const newTokens = tokens.filter(token => {
      return token.token.toDec().gt(zeroDec);
    });

    const trimSearch = search.trim();

    if (!trimSearch) {
      return newTokens;
    }

    const filtered = newTokens.filter(token => {
      return (
        token.chainInfo.chainName
          .toLowerCase()
          .includes(trimSearch.toLowerCase()) ||
        token.token.currency.coinDenom
          .toLowerCase()
          .includes(trimSearch.toLowerCase())
      );
    });

    return filtered;
  }, [search, tokens]);

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
            items={filteredTokens.map(token => {
              return (
                <TokenItem
                  viewToken={token}
                  onClick={() => {
                    navigation.dispatch({
                      ...StackActions.replace('Send', {
                        chainId: token.chainInfo.chainId,
                        coinMinimalDenom: token.token.currency.coinMinimalDenom,
                      }),
                    });
                  }}
                />
              );
            })}
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
