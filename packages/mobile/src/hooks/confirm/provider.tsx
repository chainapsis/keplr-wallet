import React, {
  FunctionComponent,
  PropsWithChildren,
  useMemo,
  useRef,
  useState,
} from 'react';
import {ConfirmContext} from './internal';
import {Modal} from '../../components/modal';
import {XAxis, YAxis} from '../../components/axis';
import {Box} from '../../components/box';
import {BottomSheetModal, BottomSheetView} from '@gorhom/bottom-sheet';
import {Text} from 'react-native';
import {TextButton} from '../../components/text-button';
import {useIntl} from 'react-intl';
import {Button} from '../../components/button';
import {Gutter} from '../../components/gutter';
import {useStyle} from '../../styles';

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

  const confirmModalRef = useRef<BottomSheetModal>(null);
  const seqRef = useRef(0);
  const style = useStyle();
  const intl = useIntl();

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
        confirmModalRef.current?.present();
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
      <Modal isConfirmModal={true} ref={confirmModalRef} snapPoints={[165]}>
        <BottomSheetView>
          <YAxis alignX="center">
            <Box
              width="85%"
              backgroundColor={
                style.get('background-color-gray-600').backgroundColor
              }
              paddingX={24}
              paddingY={24}
              borderRadius={8}>
              <YAxis>
                {confirm?.title ? (
                  <React.Fragment>
                    <Text
                      style={style.flatten(['subtitle1', 'color-text-high'])}>
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
                            confirmModalRef.current?.dismiss();
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
                      // style={{
                      //   minWidth: '4.875rem',
                      // }}
                      onPress={() => {
                        confirm?.resolver(true);
                        confirmModalRef.current?.dismiss();
                      }}
                    />
                  </XAxis>
                </YAxis>
              </YAxis>
            </Box>
          </YAxis>
        </BottomSheetView>
      </Modal>
    </ConfirmContext.Provider>
  );
};
