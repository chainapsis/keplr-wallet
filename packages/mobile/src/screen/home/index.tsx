import {observer} from 'mobx-react-lite';
import React, {FunctionComponent, useMemo} from 'react';
import {Text, View} from 'react-native';
import {useStyle} from '../../styles';
import {PageWithScrollView} from '../../components/page';
import {useStore} from '../../stores';
import {PricePretty} from '@keplr-wallet/unit';

export const HomeScreen: FunctionComponent = observer(() => {
  const style = useStyle();
  const {hugeQueriesStore} = useStore();

  const availableTotalPrice = useMemo(() => {
    let result: PricePretty | undefined;
    for (const bal of hugeQueriesStore.allKnownBalances) {
      console.log('bar  \n', bal.chainInfo.chainId);
      if (bal.price) {
        if (!result) {
          result = bal.price;
        } else {
          result = result.add(bal.price);
        }
      }
    }
    return result;
  }, [hugeQueriesStore.allKnownBalances]);

  console.log(availableTotalPrice?.toString());

  return (
    <React.Fragment>
      <PageWithScrollView backgroundMode={'default'}>
        <View>
          <Text
            style={style.flatten([
              'color-white',
              'font-extrabold',
              'font-medium',
              'h1',
            ])}>
            test
          </Text>
          <Text
            style={style.flatten([
              'color-white',
              'font-extrabold',
              'font-medium',
              'h1',
            ])}>
            test
          </Text>
          <Text
            style={style.flatten([
              'color-white',
              'font-extrabold',
              'font-medium',
              'h1',
            ])}>
            test
          </Text>
          <Text
            style={style.flatten([
              'color-white',
              'font-extrabold',
              'font-medium',
              'h1',
            ])}>
            test
          </Text>
          <Text
            style={style.flatten([
              'color-white',
              'font-extrabold',
              'font-medium',
              'h1',
            ])}>
            test
          </Text>
          <Text
            style={style.flatten([
              'color-white',
              'font-extrabold',
              'font-medium',
              'h1',
            ])}>
            test
          </Text>
          <Text
            style={style.flatten([
              'color-white',
              'font-extrabold',
              'font-medium',
              'h1',
            ])}>
            test
          </Text>
          <Text
            style={style.flatten([
              'color-white',
              'font-extrabold',
              'font-medium',
              'h1',
            ])}>
            test
          </Text>

          <Text
            style={style.flatten([
              'color-white',
              'font-extrabold',
              'font-medium',
              'h1',
            ])}>
            test
          </Text>
          <Text
            style={style.flatten([
              'color-white',
              'font-extrabold',
              'font-medium',
              'h1',
            ])}>
            test
          </Text>
          <Text
            style={style.flatten([
              'color-white',
              'font-extrabold',
              'font-medium',
              'h1',
            ])}>
            test
          </Text>
          <Text
            style={style.flatten([
              'color-red-100',
              'font-extrabold',
              'font-medium',
              'h1',
            ])}>
            test
          </Text>
          <Text
            style={style.flatten([
              'color-red-100',
              'font-extrabold',
              'font-medium',
              'h1',
            ])}>
            test
          </Text>
          <Text
            style={style.flatten([
              'color-red-100',
              'font-extrabold',
              'font-medium',
              'h1',
            ])}>
            test
          </Text>
        </View>
      </PageWithScrollView>
    </React.Fragment>
  );
});
