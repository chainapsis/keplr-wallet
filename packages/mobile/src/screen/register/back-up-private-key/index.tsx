import React, {FunctionComponent} from 'react';
import {useStyle} from '../../../styles';
import {StyleSheet, Text} from 'react-native';
import {FormattedMessage, useIntl} from 'react-intl';
import {ScrollViewRegisterContainer} from '../components/scroll-view-register-container';
import {Box} from '../../../components/box';
import {Gutter} from '../../../components/gutter';
import {CopyToClipboard} from '../new-mnemonic';
import {BlurView} from '@react-native-community/blur';
import {WarningBox} from '../../../components/guide-box';
import {Path, Svg} from 'react-native-svg';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';

export const BackUpPrivateKeyScreen: FunctionComponent = () => {
  const intl = useIntl();
  const style = useStyle();
  // TODO: 로직 추가 후 진행
  // const navigation = useNavigation<StackNavProp>();

  const [isShowPrivate, setIsShowPrivate] = React.useState(false);

  return (
    <ScrollViewRegisterContainer
      padding={20}
      contentContainerStyle={{
        alignItems: 'flex-start',
      }}
      bottomButton={{
        text: intl.formatMessage({
          id: 'button.next',
        }),
        size: 'large',
        onPress: () => {
          // TODO: 로직 추가 후 진행
          // navigation.reset({
          //   routes: [
          //     {
          //       name: 'Register.FinalizeKey',
          //       params: {
          //         name: name,
          //         password: password,
          //         privateKey,
          //       },
          //     },
          //   ],
          // });
        },
      }}>
      <Text
        style={StyleSheet.flatten([
          style.flatten(['color-gray-100', 'subtitle3']),
          {zIndex: 1},
        ])}>
        <FormattedMessage id="page.wallet.private-key-title" />
      </Text>

      <Gutter size={6} />

      <Box
        width="100%"
        padding={16}
        borderRadius={8}
        backgroundColor={style.get('color-gray-600').color}>
        <Box>
          <Text style={style.flatten(['color-gray-300', 'body2'])}>
            private key test
          </Text>

          <Gutter size={90} />

          <CopyToClipboard text={'private key test'} />
        </Box>

        {!isShowPrivate ? (
          <React.Fragment>
            <BlurView
              style={style.flatten(['absolute-fill'])}
              blurType="dark"
              blurAmount={10}
              onTouchEnd={() => {
                setIsShowPrivate(true);
              }}
              reducedTransparencyFallbackColor="black"
            />

            <Box
              alignX="center"
              alignY="center"
              style={style.flatten(['absolute-fill'])}>
              <TouchableWithoutFeedback
                onPress={() => setIsShowPrivate(true)}
                style={{flexDirection: 'row'}}>
                <Text style={style.flatten(['color-gray-300', 'subtitle3'])}>
                  <FormattedMessage id="pages.register.back-up-private-key.blur-text" />
                </Text>

                <Gutter size={6} />

                <EyeIcon />
              </TouchableWithoutFeedback>
            </Box>
          </React.Fragment>
        ) : null}
      </Box>

      <Gutter size={12} />

      <WarningBox
        title={intl.formatMessage({
          id: 'pages.register.back-up-private-key.warning-title',
        })}
        paragraph={intl.formatMessage(
          {
            id: 'pages.register.back-up-private-key.warning-paragraph',
          },
          {br: '\n'},
        )}
      />
    </ScrollViewRegisterContainer>
  );
};

const EyeIcon: FunctionComponent = () => {
  return (
    <Svg width="21" height="24" viewBox="0 0 21 24" fill="none">
      <Path
        d="M17.3349 20.5001H17.3356C17.3448 20.5001 17.3618 20.4974 17.3847 20.4795L17.6925 20.8736L17.3847 20.4795C17.4088 20.4607 17.4379 20.4253 17.4576 20.37C17.4772 20.3147 17.4831 20.2504 17.4724 20.1878C17.4618 20.1252 17.4368 20.0766 17.4099 20.0451L17.3349 20.5001ZM17.3349 20.5001C17.3285 20.5001 17.3196 20.4988 17.3081 20.4932L17.0901 20.9432L17.3081 20.4932C17.2962 20.4874 17.2799 20.4763 17.2626 20.456L17.2619 20.4551L3.14154 3.96127C3.10659 3.91644 3.07892 3.8449 3.07986 3.75955C3.08082 3.67195 3.11154 3.60077 3.14772 3.55851C3.18198 3.51849 3.21068 3.51383 3.22116 3.51368C3.23108 3.51353 3.25721 3.51685 3.28968 3.55136L17.4098 20.045L17.3349 20.5001ZM7.7377 12.4571C7.73544 12.4377 7.73844 12.418 7.74628 12.4007C7.75412 12.3833 7.76641 12.3693 7.78142 12.3606C7.79643 12.3518 7.8134 12.3488 7.82996 12.3519L7.81261 12.4307L7.81567 12.428L7.81902 12.4252L7.87374 12.3779M7.7377 12.4571C7.73918 12.4683 7.74072 12.4794 7.7423 12.4904L7.78806 12.4513L7.7377 12.4571ZM7.7377 12.4571L7.78922 12.4503L7.81228 12.4305L7.81576 12.4275L7.81887 12.4249L7.87374 12.3779M7.87374 12.3779L7.92069 12.4328L7.84071 12.4434L7.83045 12.4448L7.81207 12.4472M7.87374 12.3779L7.81207 12.4472M7.81207 12.4472L7.81497 12.4318L7.81207 12.4472ZM12.7306 11.578L12.7242 11.5669L12.7306 11.578ZM12.7306 11.578L12.7308 11.5783L12.7306 11.578ZM7.98621 12.5093L7.92306 12.4355L7.84372 12.4448L7.83129 12.4462L7.81183 12.4485L7.78889 12.4512L7.74242 12.4913C7.7507 12.549 7.76041 12.6064 7.77151 12.6633C7.78383 12.7264 7.79787 12.7889 7.8136 12.8507C7.89246 12.8514 7.96832 12.8303 8.03303 12.7927C8.07934 12.7657 8.11682 12.7323 8.14625 12.6962L7.98621 12.5093ZM9.55392 14.3405C9.29307 14.222 9.04922 14.0387 8.84046 13.7949C8.6364 13.5565 8.47422 13.2695 8.36504 12.9518L9.55392 14.3405Z"
        fill="#72747B"
        stroke="#72747B"
      />
      <Path
        d="M6.01269 10.9754C5.88843 11.6587 5.88976 12.3649 6.01705 13.0483C6.15292 13.7777 6.42957 14.4662 6.8301 15.0611C7.23072 15.6561 7.74656 16.1442 8.34311 16.4827C8.94016 16.8214 9.60031 17 10.2729 17L6.01269 10.9754ZM6.01269 10.9754L3.67403 8.24242C2.82936 9.13103 2.03628 10.1921 1.30131 11.421C1.20319 11.5856 1.14553 11.7876 1.14224 12.0008C1.13895 12.2141 1.19039 12.4192 1.28413 12.5891L1.285 12.5907C2.31625 14.4758 3.63601 16.0497 5.09171 17.1497L5.09182 17.1497C6.72886 18.3874 8.46513 18.9998 10.2597 19C11.0409 18.9975 11.8186 18.8758 12.5737 18.6379L11.0947 16.9107C10.8243 16.9701 10.5492 17.0001 10.2729 17C10.273 17 10.2731 17 10.2732 17L6.01269 10.9754ZM19.2647 12.5743L19.2643 12.575C18.6109 13.7773 17.8216 14.8668 16.9195 15.8145L14.5362 13.0285C14.6788 12.2481 14.6573 11.4387 14.4726 10.6684C14.2769 9.85256 13.9031 9.10214 13.3807 8.49193C12.858 7.88133 12.202 7.42979 11.4717 7.19075C10.8139 6.97548 10.1217 6.94124 9.45156 7.08956L7.97793 5.36822C8.72162 5.12508 9.48945 5.00128 10.2607 5C11.9946 5.0001 13.7771 5.63628 15.4149 6.8712C16.8961 7.98858 18.2298 9.56158 19.2622 11.4265C19.3537 11.5924 19.4055 11.7915 19.406 11.9996C19.4065 12.2079 19.3556 12.4076 19.2647 12.5743ZM17.1681 16.105C17.1683 16.1053 17.1685 16.1055 17.1687 16.1058L17.1686 16.1056L17.1681 16.105ZM14.4416 12.9179C14.4417 12.918 14.4418 12.9181 14.4419 12.9183L14.4418 12.9181L14.4416 12.9179ZM9.59148 7.25299L9.59118 7.25265L9.59148 7.25299ZM7.55931 5.51872L7.56086 5.51811L7.55931 5.51872ZM12.8603 18.9727C12.8602 18.9726 12.8601 18.9725 12.86 18.9724L12.8602 18.9726L12.8603 18.9727ZM13.0006 18.4901L12.9987 18.4908L13.0006 18.4901ZM6.5291 10.9392C6.53591 10.9077 6.53561 10.8747 6.52823 10.8434L6.5291 10.9392ZM13.091 18.775L13.1048 18.7717L13.091 18.775Z"
        fill="#72747B"
        stroke="#72747B"
      />
    </Svg>
  );
};
