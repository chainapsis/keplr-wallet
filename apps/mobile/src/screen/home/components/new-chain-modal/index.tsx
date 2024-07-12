import {useStyle} from '../../../../styles';
import {Platform, SafeAreaView, StatusBar, Text} from 'react-native';
import {Box} from '../../../../components/box';
import React, {FunctionComponent} from 'react';
import {Button} from '../../../../components/button';
import {IconProps} from '../../../../components/icon/types.ts';
import Svg, {Path} from 'react-native-svg';
import {registerModal} from '../../../../components/modal/v2';
import {FormattedMessage, useIntl} from 'react-intl';
import {observer} from 'mobx-react-lite';
import {useStore} from '../../../../stores';

export const NewChainModal = registerModal<{
  setIsOpen: (isOpen: boolean) => void;
  afterConfirm: () => void;
}>(
  observer(({afterConfirm, setIsOpen}) => {
    const intl = useIntl();
    const style = useStyle();

    const {chainStore, uiConfigStore} = useStore();

    return (
      <SafeAreaView>
        <Box
          alignY="center"
          marginTop={
            Platform.OS === 'android' ? 38 + (StatusBar.currentHeight ?? 0) : 30
          }
          marginLeft={10}>
          <Box paddingLeft={16}>
            <TopArrowIcon size={16} />
          </Box>
          <Box
            width={300}
            maxWidth={300}
            paddingX={16}
            paddingY={20}
            borderRadius={6}
            borderColor={style.get('color-gray-500').color}
            borderWidth={1}
            backgroundColor={style.get('color-gray-600').color}>
            <Text style={style.flatten(['subtitle3', 'color-white'])}>
              <FormattedMessage
                id="page.main.layouts.header.new-chain.title"
                values={{
                  chains:
                    uiConfigStore.newChainSuggestionConfig.newSuggestionChains
                      .map(chain => {
                        return chainStore.getChain(chain).chainName;
                      })
                      .join(', '),
                }}
              />
            </Text>

            <Text style={style.flatten(['body2', 'color-gray-200'])}>
              <FormattedMessage id="page.main.layouts.header.new-chain.paragraph" />
            </Text>

            <Box alignX="right">
              <Button
                text={intl.formatMessage({
                  id: 'page.main.layouts.header.new-chain.button',
                })}
                color="secondary"
                onPress={() => {
                  afterConfirm();

                  if (
                    uiConfigStore.newChainSuggestionConfig.newSuggestionChains
                      .length > 0
                  ) {
                    uiConfigStore.newChainSuggestionConfig.turnOffSuggestionChains(
                      ...uiConfigStore.newChainSuggestionConfig
                        .newSuggestionChains,
                    );
                  }

                  setIsOpen(false);
                }}
              />
            </Box>
          </Box>
        </Box>
      </SafeAreaView>
    );
  }),
  {align: 'top', openImmediately: true},
);

const TopArrowIcon: FunctionComponent<IconProps> = ({size}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <Path d="M9 2L17 18L1 18L9 2Z" fill="#1D1D1F" stroke="#2E2E32" />
    </Svg>
  );
};
