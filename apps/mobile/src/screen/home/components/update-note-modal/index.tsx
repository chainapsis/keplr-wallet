import React, {FunctionComponent, useEffect, useState} from 'react';
import {registerCardModal} from '../../../../components/modal/card';
import {Box} from '../../../../components/box';
import {Text} from 'react-native';
import {useStyle} from '../../../../styles';
import {HorizontalSimpleScene} from '../../../../components/transition';
import {Button} from '../../../../components/button';
import {Gutter} from '../../../../components/gutter';
import {FormattedMessage} from 'react-intl';
import * as ExpoImage from 'expo-image';
import {XAxis} from '../../../../components/axis';

export type UpdateNotePageData = {
  title: string;
  image:
    | {
        default: string;
        light: string;
        aspectRatio: string;
      }
    | undefined;
  paragraph: string;
};

export const UpdateNoteModal = registerCardModal<{
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  updateNotePageData: UpdateNotePageData[];
}>(({updateNotePageData, isOpen, setIsOpen}) => {
  const [currentScene, setCurrentScene] = useState(0);

  if (updateNotePageData.length === 0) {
    return null;
  }

  useEffect(() => {
    (async () => {
      for (const u of updateNotePageData) {
        if (u.image) {
          await ExpoImage.Image.prefetch(u.image.default);
        }
      }
    })();
  }, [updateNotePageData]);

  return (
    <Box padding={12}>
      <HorizontalSimpleScene
        currentSceneKey={`${currentScene}`}
        scenes={updateNotePageData.map((_, index) => {
          return {
            key: `${index}`,
            element: UpdateNoteScene,
          };
        })}
        sharedProps={{
          isOpen,
          setIsOpen,
          currentScene,
          setCurrentScene,
          updateNotePageData,
        }}
      />

      <Gutter size={12} />

      {(() => {
        if (updateNotePageData.length === 1) {
          return (
            <Button
              text="Close"
              size="large"
              color="secondary"
              onPress={() => setIsOpen(false)}
            />
          );
        } else {
          if (currentScene === 0) {
            return (
              <XAxis>
                <Button
                  text="Skip"
                  size="large"
                  color="secondary"
                  containerStyle={{flex: 1}}
                  onPress={() => setIsOpen(false)}
                />

                <Gutter size={12} />

                <Button
                  text="Next"
                  size="large"
                  color="primary"
                  containerStyle={{flex: 1}}
                  onPress={() => setCurrentScene(currentScene + 1)}
                />
              </XAxis>
            );
          }
          if (
            currentScene > 0 &&
            currentScene < updateNotePageData.length - 1
          ) {
            return (
              <XAxis>
                <Button
                  text="Previous"
                  size="large"
                  color="secondary"
                  containerStyle={{flex: 1}}
                  onPress={() => setCurrentScene(currentScene - 1)}
                />

                <Gutter size={12} />

                <Button
                  text="Next"
                  size="large"
                  color="primary"
                  containerStyle={{flex: 1}}
                  onPress={() => setCurrentScene(currentScene + 1)}
                />
              </XAxis>
            );
          }

          if (currentScene === updateNotePageData.length - 1) {
            return (
              <XAxis>
                <Button
                  text="Previous"
                  size="large"
                  color="secondary"
                  containerStyle={{flex: 1}}
                  onPress={() => setCurrentScene(currentScene - 1)}
                />

                <Gutter size={12} />

                <Button
                  text="Close"
                  size="large"
                  color="primary"
                  containerStyle={{flex: 1}}
                  onPress={() => setIsOpen(false)}
                />
              </XAxis>
            );
          }
        }
      })()}
    </Box>
  );
});

const UpdateNoteScene: FunctionComponent<{
  currentScene: number;
  updateNotePageData: UpdateNotePageData[];
}> = ({currentScene, updateNotePageData}) => {
  const style = useStyle();

  return (
    <Box paddingX={16}>
      <Text style={style.flatten(['h4', 'color-text-high', 'text-center'])}>
        <FormattedMessage
          id="update-node/paragraph/noop"
          defaultMessage={updateNotePageData[currentScene].title}
          values={{
            br: '\n',
            b: (...chunks: any) => (
              <Text
                style={style.flatten([
                  'h4',
                  'color-text-high',
                  'text-center',
                  'font-bold',
                ])}>
                {chunks}
              </Text>
            ),
          }}
        />
      </Text>

      {updateNotePageData[currentScene].image ? (
        <Box>
          <ExpoImage.Image
            style={{
              width: '100%',
              aspectRatio: updateNotePageData[currentScene].image?.aspectRatio,
            }}
            alt={updateNotePageData[currentScene].title}
            source={updateNotePageData[currentScene].image?.default}
          />
        </Box>
      ) : null}

      {updateNotePageData.length > 1 ? (
        <React.Fragment>
          <Text
            style={style.flatten([
              'body1',
              'color-text-middle',
              'text-center',
            ])}>
            {currentScene + 1} / {updateNotePageData.length}
          </Text>

          <Gutter size={20} />
        </React.Fragment>
      ) : null}

      <Text style={style.flatten(['body2', 'color-text-middle'])}>
        <FormattedMessage
          id="update-node/paragraph/noop"
          defaultMessage={updateNotePageData[currentScene].paragraph}
          values={{
            br: '\n',
            b: (...chunks: any) => (
              <Text
                style={style.flatten([
                  'h4',
                  'color-text-high',
                  'text-center',
                  'font-bold',
                ])}>
                {chunks}
              </Text>
            ),
          }}
        />
      </Text>
    </Box>
  );
};
