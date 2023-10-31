import React, {
  FunctionComponent,
  PropsWithChildren,
  useMemo,
  useRef,
  useState,
} from 'react';
import {ConfirmContext} from './internal';
import {XAxis, YAxis} from '../../components/axis';
import {Box} from '../../components/box';
import {Modal, Text} from 'react-native';
import {TextButton} from '../../components/text-button';
import {useIntl} from 'react-intl';
import {Button} from '../../components/button';
import {Gutter} from '../../components/gutter';
import {useStyle} from '../../styles';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export const ConfirmProvider: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const [confirm, setConfirm] = useState<{
    id: string;
    detached: boolean;
    title: string;
    paragraph: string | React.ReactNode;
    options: {
      forceYes?: boolean;
    };
    resolver: (value: boolean) => void;
  }>();
  const style = useStyle();
  const seqRef = useRef(0);
  const intl = useIntl();

  const backdropColor = style.get('color-black@50%').color;

  const backgroundColor = useSharedValue(0);
  const backgroundInterpolate = useAnimatedStyle(
    () => ({
      backgroundColor: interpolateColor(
        backgroundColor.value,
        [0, 1],
        ['transparent', backdropColor],
      ),
    }),
    [],
  );
  const [isOpen, setIsOpen] = useState(false);

  const confirmFn: (
    title: string,
    paragraph: string | React.ReactNode,
    options?: {
      forceYes?: boolean;
    },
  ) => Promise<boolean> = (title, paragraph, options = {}) => {
    return new Promise<boolean>(resolve => {
      seqRef.current = seqRef.current + 1;
      setTimeout(() => {
        setIsOpen(true);
        backgroundColor.value = withTiming(1);
      }, 500);

      setConfirm({
        id: seqRef.current.toString(),
        detached: false,
        title,
        paragraph,
        options,
        resolver: resolve,
      });
    });
  };

  const closeModal = () => {
    setIsOpen(false);
    backgroundColor.value = withTiming(0);
  };

  const confirmFnRef = useRef(confirmFn);
  confirmFnRef.current = confirmFn;
  return (
    <ConfirmContext.Provider
      value={useMemo(() => {
        return {
          confirm: confirmFnRef.current,
        };
      }, [])}>
      {children}

      <Modal
        visible={isOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => closeModal()}>
        <Box
          style={style.flatten(['flex-1'])}
          alignX="center"
          alignY="center"
          onClick={() => {
            closeModal();
          }}>
          <Box
            backgroundColor={
              style.get('background-color-gray-600').backgroundColor
            }
            paddingX={20}
            paddingY={24}
            marginX={16}
            borderRadius={8}
            onClick={e => {
              e.stopPropagation();
              e.preventDefault();
            }}>
            <YAxis>
              {confirm?.title ? (
                <React.Fragment>
                  <Text style={style.flatten(['subtitle1', 'color-text-high'])}>
                    {confirm.title}
                  </Text>
                  <Gutter size={8} />
                </React.Fragment>
              ) : null}

              <Text style={style.flatten(['color-text-middle'])}>
                {confirm?.paragraph}
              </Text>

              <Gutter size={18} />
              <YAxis alignX="right">
                <XAxis>
                  {!confirm?.options.forceYes ? (
                    <React.Fragment>
                      <TextButton
                        text={intl.formatMessage({
                          id: 'hooks.confirm.cancel-button',
                        })}
                        onPress={() => {
                          confirm?.resolver(false);
                          closeModal();
                        }}
                      />
                      <Gutter size={8} />
                    </React.Fragment>
                  ) : null}
                  <Button
                    size="small"
                    text={intl.formatMessage({
                      id: 'hooks.confirm.yes-button',
                    })}
                    onPress={() => {
                      closeModal();
                      confirm?.resolver(true);
                    }}
                  />
                </XAxis>
              </YAxis>
            </YAxis>
          </Box>
        </Box>
      </Modal>
      <Animated.View
        pointerEvents="none"
        style={[style.flatten(['absolute-fill']), backgroundInterpolate]}
      />
    </ConfirmContext.Provider>
  );
};
