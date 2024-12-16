import React, {useState} from 'react';
import {registerCardModal} from '../../../../components/modal/card';
import {Text, View} from 'react-native';
import {HorizontalSimpleScene} from '../../../../components/transition';
import {observer} from 'mobx-react-lite';
import {Box} from '../../../../components/box';
import {useStyle} from '../../../../styles';
import {useIntl} from 'react-intl';
import {Gutter} from '../../../../components/gutter';
import {XAxis} from '../../../../components/axis';
import {TextInput} from '../../../../components/input';
import {useStore} from '../../../../stores';
import {Button} from '../../../../components/button';
import {RectButton} from '../../../../components/rect-button';
import Svg, {Mask, Path, Rect, G} from 'react-native-svg';

export const RecallPasswordModal = registerCardModal<{
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}>(
  ({isOpen, setIsOpen}) => {
    const [currentScene, setCurrentScene] = useState('first');

    return (
      <HorizontalSimpleScene
        scenes={[
          {
            key: 'first',
            element: FirstScene,
          },
          {
            key: 'second',
            element: SecondScene,
          },
        ]}
        transitionAlign="bottom"
        currentSceneKey={currentScene}
        sharedProps={{
          isOpen,
          setIsOpen,
          currentScene,
          setCurrentScene,
        }}
      />
    );
  },
  {
    disableGesture: true,
    headerBorderRadius: 28,
  },
);

const FirstScene = observer<{
  setCurrentScene: (key: string) => void;
}>(({setCurrentScene}) => {
  const {keyRingStore} = useStore();

  const style = useStyle();
  const intl = useIntl();

  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  const onPressSubmit = async () => {
    try {
      setIsLoading(true);

      await keyRingStore.checkPassword(password);
    } catch (e) {
      console.log(e);

      setIsLoading(false);
      setError(e.message);
    }
  };

  return (
    <Box paddingX={22} paddingTop={35} paddingBottom={20}>
      <Text style={style.flatten(['h1', 'color-white'])}>Get Ready for</Text>
      <Text style={style.flatten(['h1', 'color-white'])}>the Major Update</Text>
      <Gutter size={36} />
      <Box width="100%">
        <XAxis>
          <Svg width="20" height="20" fill="none" viewBox="0 0 20 20">
            <Path
              stroke={style.get('color-green-400').color}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M12.992 11.975q.132.555.133 1.15a5 5 0 0 1-5 5v-4m4.867-2.15a12.48 12.48 0 0 0 5.133-10.1A12.48 12.48 0 0 0 8.026 7.008m4.966 4.967a12.4 12.4 0 0 1-4.867 2.15m-.099-7.117a5 5 0 0 0-6.151 4.867h4m2.151-4.867a12.4 12.4 0 0 0-2.15 4.867m2.249 2.25q-.13.027-.26.05c-.755-.6-1.44-1.284-2.04-2.04l.05-.26M4.01 13.867a3.75 3.75 0 0 0-1.465 3.588q.284.045.58.045a3.74 3.74 0 0 0 3.008-1.51M13.75 7.5a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0"
            />
          </Svg>
          <Gutter size={16} />
          <Box>
            <Text style={style.flatten(['subtitle2', 'color-white'])}>
              What’s coming?
            </Text>
            <Gutter size={5} />
            <Text style={style.flatten(['body1', 'color-gray-200'])}>
              {
                'Keplr is going to have a major\nupgrade with over 3x better\nperformance!'
              }
            </Text>
          </Box>
        </XAxis>
      </Box>
      <Gutter size={19} />
      <XAxis>
        <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <Mask
            id="mask0_15640_124650"
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="20"
            height="20">
            <Rect width="20" height="20" fill="#D9D9D9" />
          </Mask>
          <G mask="url(#mask0_15640_124650)">
            <Path
              d="M10 18C8.13333 18 6.48148 17.4333 5.04444 16.3C3.60741 15.1667 2.67407 13.7185 2.24444 11.9556C2.18519 11.7333 2.22963 11.5296 2.37778 11.3444C2.52593 11.1593 2.72593 11.0519 2.97778 11.0222C3.21481 10.9926 3.42963 11.037 3.62222 11.1556C3.81481 11.2741 3.94815 11.4519 4.02222 11.6889C4.37778 13.0222 5.11111 14.1111 6.22222 14.9556C7.33333 15.8 8.59259 16.2222 10 16.2222C11.7333 16.2222 13.2037 15.6185 14.4111 14.4111C15.6185 13.2037 16.2222 11.7333 16.2222 10C16.2222 8.26667 15.6185 6.7963 14.4111 5.58889C13.2037 4.38148 11.7333 3.77778 10 3.77778C8.97778 3.77778 8.02222 4.01481 7.13333 4.48889C6.24444 4.96296 5.4963 5.61481 4.88889 6.44444H6.44444C6.6963 6.44444 6.90741 6.52963 7.07778 6.7C7.24815 6.87037 7.33333 7.08148 7.33333 7.33333C7.33333 7.58519 7.24815 7.7963 7.07778 7.96667C6.90741 8.13704 6.6963 8.22222 6.44444 8.22222H2.88889C2.63704 8.22222 2.42593 8.13704 2.25556 7.96667C2.08519 7.7963 2 7.58519 2 7.33333V3.77778C2 3.52593 2.08519 3.31481 2.25556 3.14444C2.42593 2.97407 2.63704 2.88889 2.88889 2.88889C3.14074 2.88889 3.35185 2.97407 3.52222 3.14444C3.69259 3.31481 3.77778 3.52593 3.77778 3.77778V4.97778C4.53333 4.02963 5.45556 3.2963 6.54444 2.77778C7.63333 2.25926 8.78519 2 10 2C11.1111 2 12.1519 2.21111 13.1222 2.63333C14.0926 3.05556 14.937 3.62593 15.6556 4.34444C16.3741 5.06296 16.9444 5.90741 17.3667 6.87778C17.7889 7.84815 18 8.88889 18 10C18 11.1111 17.7889 12.1519 17.3667 13.1222C16.9444 14.0926 16.3741 14.937 15.6556 15.6556C14.937 16.3741 14.0926 16.9444 13.1222 17.3667C12.1519 17.7889 11.1111 18 10 18ZM10.8889 9.64444L13.1111 11.8667C13.2741 12.0296 13.3556 12.237 13.3556 12.4889C13.3556 12.7407 13.2741 12.9481 13.1111 13.1111C12.9481 13.2741 12.7407 13.3556 12.4889 13.3556C12.237 13.3556 12.0296 13.2741 11.8667 13.1111L9.37778 10.6222C9.28889 10.5333 9.22222 10.4333 9.17778 10.3222C9.13333 10.2111 9.11111 10.0963 9.11111 9.97778V6.44444C9.11111 6.19259 9.1963 5.98148 9.36667 5.81111C9.53704 5.64074 9.74815 5.55556 10 5.55556C10.2519 5.55556 10.463 5.64074 10.6333 5.81111C10.8037 5.98148 10.8889 6.19259 10.8889 6.44444V9.64444Z"
              fill={style.get('color-green-400').color}
            />
          </G>
        </Svg>
        <Gutter size={16} />
        <Box>
          <Text style={style.flatten(['subtitle2', 'color-white'])}>
            Biometric data will be reset
          </Text>
          <Gutter size={5} />
          <Text style={style.flatten(['body1', 'color-gray-200'])}>
            {
              'When the new version is released,\nbiometric auth data will be reset.'
            }
          </Text>
        </Box>
      </XAxis>
      <Gutter size={19} />
      <XAxis>
        <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <Path
            d="M3.34261 17.4316H16.6575C16.8737 17.4316 17.0863 17.3755 17.2743 17.2687C17.4624 17.1619 17.6195 17.0082 17.7304 16.8226C17.8413 16.6369 17.9021 16.4256 17.9069 16.2094C17.9117 15.9932 17.8604 15.7795 17.7578 15.5891L11.1008 3.22578C10.6285 2.34922 9.37152 2.34922 8.89925 3.22578L2.24222 15.5891C2.1397 15.7795 2.08834 15.9932 2.09314 16.2094C2.09795 16.4256 2.15877 16.6369 2.26965 16.8226C2.38053 17.0082 2.53768 17.1619 2.72574 17.2687C2.91381 17.3755 3.12636 17.4316 3.34261 17.4316V17.4316Z"
            stroke={style.get('color-green-400').color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M9.77585 7.63233L10.0001 12.398L10.2239 7.63429C10.2253 7.60383 10.2204 7.57342 10.2097 7.5449C10.1989 7.51638 10.1824 7.49036 10.1613 7.46842C10.1401 7.44649 10.1147 7.4291 10.0865 7.41732C10.0584 7.40554 10.0282 7.39962 9.99772 7.39991V7.39991C9.96777 7.40021 9.93818 7.4065 9.91071 7.41841C9.88323 7.43033 9.85841 7.44763 9.83773 7.4693C9.81705 7.49096 9.80092 7.51655 9.79029 7.54455C9.77966 7.57256 9.77475 7.6024 9.77585 7.63233V7.63233Z"
            stroke={style.get('color-green-400').color}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M10 15.5176C9.84549 15.5176 9.69444 15.4718 9.56596 15.3859C9.43749 15.3001 9.33735 15.1781 9.27822 15.0353C9.21909 14.8925 9.20362 14.7355 9.23376 14.5839C9.26391 14.4324 9.33831 14.2932 9.44757 14.1839C9.55683 14.0746 9.69604 14.0002 9.84759 13.9701C9.99914 13.9399 10.1562 13.9554 10.299 14.0145C10.4417 14.0737 10.5637 14.1738 10.6496 14.3023C10.7354 14.4308 10.7813 14.5818 10.7813 14.7363C10.7813 14.9435 10.6989 15.1422 10.5524 15.2888C10.4059 15.4353 10.2072 15.5176 10 15.5176Z"
            fill={style.get('color-green-400').color}
          />
        </Svg>
        <Gutter size={16} />
        <Box>
          <Text style={style.flatten(['subtitle2', 'color-white'])}>
            Back up your password
          </Text>
          <Gutter size={5} />
          <Text style={style.flatten(['body1', 'color-gray-200'])}>
            <Text>{'We '}</Text>
            <Text style={style.flatten(['font-bold'])}>strongly recommend</Text>
            <Text>{' to back up\nyour password before the update!'}</Text>
          </Text>
        </Box>
      </XAxis>

      <Gutter size={36} />
      <TextInput
        label={intl.formatMessage({
          id: 'page.unlock.bottom-section.password-input-label',
        })}
        placeholder="Type Your Password"
        value={password}
        secureTextEntry={true}
        returnKeyType="done"
        onChangeText={setPassword}
        onSubmitEditing={onPressSubmit}
        error={
          error ? intl.formatMessage({id: 'error.invalid-password'}) : undefined
        }
      />
      <Gutter size={20} />
      <Button text="Confirm Password" size="large" />
      <Gutter size={12} />
      <Button
        text="I forgot my password"
        size="large"
        color="secondary"
        onPress={() => {
          setCurrentScene('second');
        }}
      />
    </Box>
  );
});

const SecondScene = observer<{
  setCurrentScene: (key: string) => void;
}>(({setCurrentScene}) => {
  const style = useStyle();

  return (
    <Box paddingX={22} paddingTop={35} paddingBottom={20}>
      <Text style={style.flatten(['h1', 'color-white'])}>Backup your</Text>
      <Text style={style.flatten(['h1', 'color-white'])}>
        Keplr Mobile password
      </Text>
      <Gutter size={41} />
      <Text style={style.flatten(['subtitle2', 'color-white'])}>
        Your Password
      </Text>
      <Box height={1} backgroundColor={style.get('color-gray-400').color} />
      <Gutter size={16} />
      <XAxis>
        <View style={{flex: 1}} />
        <RectButton
          style={style.flatten(['border-radius-6'])}
          onPress={() => {
            // TODO
          }}>
          <Box
            style={style.flatten([
              'border-radius-6',
              'height-40',
              'items-center',
              'justify-center',
              'padding-x-12',
            ])}>
            <Text style={style.flatten(['text-button1', 'color-gray-50'])}>
              Show
            </Text>
          </Box>
        </RectButton>
        <Gutter size={16} />
        <RectButton
          style={style.flatten(['border-radius-6'])}
          onPress={() => {
            // TODO
          }}>
          <Box
            style={style.flatten([
              'border-radius-6',
              'height-40',
              'items-center',
              'justify-center',
              'padding-x-12',
            ])}>
            <Text style={style.flatten(['text-button1', 'color-gray-50'])}>
              Copy Password
            </Text>
          </Box>
        </RectButton>
        <View style={{flex: 1}} />
      </XAxis>

      <Gutter size={41} />

      <XAxis>
        <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <Path
            d="M7.5 10.6248L9.375 12.4998L12.5 8.12483M10 2.26172C8.20792 3.9589 5.78802 4.99984 3.125 4.99984C3.08269 4.99984 3.04043 4.99958 2.99825 4.99906C2.67491 5.98248 2.5 7.03325 2.5 8.12488C2.5 12.7845 5.68693 16.6997 10 17.8098C14.3131 16.6997 17.5 12.7845 17.5 8.12488C17.5 7.03325 17.3251 5.98248 17.0018 4.99906C16.9596 4.99958 16.9173 4.99984 16.875 4.99984C14.212 4.99984 11.7921 3.9589 10 2.26172Z"
            stroke={style.get('color-green-400').color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
        <Gutter size={16} />
        <Box>
          <Text style={style.flatten(['subtitle2', 'color-white'])}>
            Keep your assets safe
          </Text>
          <Gutter size={5} />
          <Text style={style.flatten(['body1', 'color-gray-200'])}>
            {'Remember your password and back\nup your secret passphrase.'}
          </Text>
        </Box>
      </XAxis>
      <Gutter size={26} />
      <XAxis>
        <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <Path
            d="M3.34261 17.4316H16.6575C16.8737 17.4316 17.0863 17.3755 17.2743 17.2687C17.4624 17.1619 17.6195 17.0082 17.7304 16.8226C17.8413 16.6369 17.9021 16.4256 17.9069 16.2094C17.9117 15.9932 17.8604 15.7795 17.7578 15.5891L11.1008 3.22578C10.6285 2.34922 9.37152 2.34922 8.89925 3.22578L2.24222 15.5891C2.1397 15.7795 2.08834 15.9932 2.09314 16.2094C2.09795 16.4256 2.15877 16.6369 2.26965 16.8226C2.38053 17.0082 2.53768 17.1619 2.72574 17.2687C2.91381 17.3755 3.12636 17.4316 3.34261 17.4316V17.4316Z"
            stroke={style.get('color-green-400').color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M9.77582 7.63233L10 12.398L10.2239 7.63429C10.2253 7.60383 10.2204 7.57342 10.2096 7.5449C10.1989 7.51638 10.1824 7.49036 10.1612 7.46842C10.1401 7.44649 10.1146 7.4291 10.0865 7.41732C10.0584 7.40554 10.0282 7.39962 9.99769 7.39991V7.39991C9.96774 7.40021 9.93815 7.4065 9.91068 7.41841C9.8832 7.43033 9.85838 7.44763 9.8377 7.4693C9.81702 7.49096 9.80089 7.51655 9.79026 7.54455C9.77963 7.57256 9.77472 7.6024 9.77582 7.63233V7.63233Z"
            stroke={style.get('color-green-400').color}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M10 15.5176C9.84549 15.5176 9.69444 15.4718 9.56596 15.3859C9.43749 15.3001 9.33735 15.1781 9.27822 15.0353C9.21909 14.8925 9.20362 14.7355 9.23376 14.5839C9.26391 14.4324 9.33831 14.2932 9.44757 14.1839C9.55683 14.0746 9.69604 14.0002 9.84759 13.9701C9.99914 13.9399 10.1562 13.9554 10.299 14.0145C10.4417 14.0737 10.5637 14.1738 10.6496 14.3023C10.7354 14.4308 10.7813 14.5818 10.7813 14.7363C10.7813 14.9435 10.6989 15.1422 10.5524 15.2888C10.4059 15.4353 10.2072 15.5176 10 15.5176Z"
            fill={style.get('color-green-400').color}
          />
        </Svg>
        <Gutter size={16} />
        <Box>
          <Text style={style.flatten(['subtitle2', 'color-white'])}>
            Back up your password
          </Text>
          <Gutter size={5} />
          <Text style={style.flatten(['body1', 'color-gray-200'])}>
            {
              'You will need to enter your password\nafter the update to enable biometric\nauthentication after the update.'
            }
          </Text>
        </Box>
      </XAxis>

      <Gutter size={41} />
      <Button
        text="Go Back"
        size="large"
        color="secondary"
        leftIcon={
          <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <Path
              d="M9.53125 15.625L3.90625 10L9.53125 4.375M4.6875 10H16.0937"
              stroke={style.get('color-white').color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        }
        onPress={() => {
          setCurrentScene('first');
        }}
      />
    </Box>
  );
});
