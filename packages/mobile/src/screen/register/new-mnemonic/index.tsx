import React, {
  FunctionComponent,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import {observer} from 'mobx-react-lite';
import {useIntl} from 'react-intl';
import {RegisterHeader} from '../../../components/pageHeader/header-register';
import {useStyle} from '../../../styles';
import {useNavigation} from '@react-navigation/native';
import {Box} from '../../../components/box';
import {Text, View} from 'react-native';
import {HorizontalRadioGroup} from '../../../components/radio-group';
import {Mnemonic} from '@keplr-wallet/crypto';
import * as Crypto from 'expo-crypto';
import * as Clipboard from 'expo-clipboard';
import {PageWithScrollView} from '../../../components/page';
import {TextButton} from '../../../components/text-button';
import {Gutter} from '../../../components/gutter';
import {Button} from '../../../components/button';
import {WarningBox} from '../../../components/guide-box';
import LottieView from 'lottie-react-native';

type WordsType = '12words' | '24words';

const Header: FunctionComponent = () => {
  const intl = useIntl();

  return (
    <RegisterHeader
      title={intl.formatMessage({
        id: 'pages.register.new-mnemonic.title',
      })}
      paragraph={'Step 1/3'}
    />
  );
};

export const NewMnemonicScreen: FunctionComponent = observer(() => {
  const intl = useIntl();
  const style = useStyle();
  const navigation = useNavigation();

  const [words, setWords] = useState<string[]>([]);
  const [wordsType, setWordsType] = useState<WordsType>('12words');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <Header />,
    });
  }, [navigation]);

  useEffect(() => {
    const rng = (array: any) => {
      return Promise.resolve(Crypto.getRandomValues(array));
    };

    if (wordsType === '12words') {
      Mnemonic.generateSeed(rng, 128).then(str => setWords(str.split(' ')));
    } else if (wordsType === '24words') {
      Mnemonic.generateSeed(rng, 256).then(str => setWords(str.split(' ')));
    } else {
      throw new Error(`Unknown words type: ${wordsType}`);
    }
  }, [wordsType]);

  return (
    <React.Fragment>
      <PageWithScrollView
        backgroundMode={'default'}
        containerStyle={style.flatten(['border-width-top-0'])}
        style={style.flatten(['padding-x-20'])}>
        <HorizontalRadioGroup
          size="large"
          selectedKey={wordsType}
          onSelect={key => {
            setWordsType(key as WordsType);
          }}
          itemMinWidth={100}
          items={[
            {
              key: '12words',
              text: intl.formatMessage({
                id: 'pages.register.new-mnemonic.12-words-tab',
              }),
            },
            {
              key: '24words',
              text: intl.formatMessage({
                id: 'pages.register.new-mnemonic.24-words-tab',
              }),
            },
          ]}
        />

        <Box
          padding={20}
          backgroundColor={style.get('color-gray-600').color}
          borderRadius={6}>
          <View
            style={style.flatten([
              'flex-row',
              'flex-wrap',
              'items-center',
              'justify-center',
            ])}>
            {words.map((word, index) => (
              <MnemonicTag key={word} index={index} word={word} />
            ))}
          </View>

          <Gutter size={20} />

          <CopyToClipboard text={words.join(' ')} />
        </Box>

        <Gutter size={10} />

        <WarningBox
          title={intl.formatMessage({
            id: 'pages.register.new-mnemonic.recovery-warning-box-title',
          })}
          paragraph={intl.formatMessage({
            id: 'pages.register.new-mnemonic.recovery-warning-box-paragraph',
          })}
        />

        <Gutter size={10} />

        <WarningBox
          title={intl.formatMessage({
            id: 'pages.register.new-mnemonic.back-up-warning-box-title',
          })}
          paragraph={intl.formatMessage({
            id: 'pages.register.new-mnemonic.back-up-warning-box-paragraph',
          })}
        />
      </PageWithScrollView>

      <Box padding={20}>
        <Button
          text={intl.formatMessage({
            id: 'button.next',
          })}
          size="large"
        />
      </Box>
    </React.Fragment>
  );
});

const MnemonicTag: FunctionComponent<{index: number; word: string}> = ({
  index,
  word,
}) => {
  const style = useStyle();

  return (
    <Box
      paddingX={12}
      paddingY={4}
      borderRadius={8}
      borderWidth={2}
      marginRight={16}
      marginBottom={16}
      borderColor={style.get('color-gray-500').color}>
      <Text style={style.flatten(['subtitle2', 'color-white'])}>{`${
        index + 1
      }. ${word}`}</Text>
    </Box>
  );
};

const CopyToClipboard: FunctionComponent<{text: string}> = ({text}) => {
  const intl = useIntl();
  const style = useStyle();
  const [hasCopied, setHasCopied] = useState(false);

  return (
    <TextButton
      text={
        hasCopied
          ? intl.formatMessage({
              id: 'pages.register.components.copy-to-clipboard.button-after',
            })
          : intl.formatMessage({
              id: 'pages.register.components.copy-to-clipboard.button-before',
            })
      }
      textStyle={style.flatten([
        hasCopied ? 'color-green-400' : 'color-gray-50',
      ])}
      size="large"
      onPress={async () => {
        await Clipboard.setStringAsync(text);

        setHasCopied(true);

        setTimeout(() => {
          setHasCopied(false);
        }, 1000);
      }}
      rightIcon={
        hasCopied ? (
          <LottieView
            source={require('../../../public/assets/lottie/register/check-circle-icon.json')}
            loop={false}
            autoPlay
            style={style.flatten(['width-20', 'height-20'])}
          />
        ) : undefined
      }
    />
  );
};
