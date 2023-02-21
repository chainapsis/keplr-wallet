import React, {
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { StyleSheet, View, Text } from "react-native";
import { useStyle } from "../../../../styles";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import Animated, { EasingNode } from "react-native-reanimated";

export const LabelSelector: FunctionComponent<{
  selectedKey: string;
  labels: {
    key: string;
    label: string;
  }[];
  onLabelSelect: (key: string) => void;
}> = ({ selectedKey, labels, onLabelSelect }) => {
  const style = useStyle();

  // For easy usage and avoid re-rendering, no need to be state.
  const labelDefaultWidthArray = useRef<Array<number>>([]);

  const scrollViewRef = useRef<Animated.ScrollView | null>(null);

  return (
    <View
      style={style.flatten([
        "height-40",
        "margin-bottom-20",
        "flex-row",
        "items-end",
      ])}
    >
      <Animated.ScrollView
        ref={scrollViewRef}
        style={{
          height: 200,
        }}
        contentContainerStyle={style.flatten(["items-end", "margin-bottom-8"])}
        horizontal={true}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        {labels.map((label, index) => {
          const isSelected = label.key === selectedKey;

          return (
            <Label
              key={label.key}
              label={label.label}
              isSelected={isSelected}
              onSelect={() => {
                onLabelSelect(label.key);

                if (scrollViewRef.current) {
                  let targetX = 0;
                  for (let i = 0; i < index - 1; i++) {
                    if (labelDefaultWidthArray.current[i]) {
                      targetX += labelDefaultWidthArray.current[i];
                    }
                  }
                  scrollViewRef.current.scrollTo({
                    x: targetX,
                    animated: true,
                  });
                }
              }}
              onDefaultLabelLayout={(width) => {
                labelDefaultWidthArray.current[index] = width;
              }}
            />
          );
        })}
      </Animated.ScrollView>
    </View>
  );
};

const usePreviousDiff = () => {
  const [previous] = useState(() => new Animated.Value<number>());

  return useMemo(() => {
    return {
      set: (value: Animated.Adaptable<number>) => Animated.set(previous, value),
      diff: (value: Animated.Adaptable<number>) =>
        Animated.cond(
          Animated.defined(previous),
          Animated.sub(value, previous),
          0
        ),
      previous,
    };
  }, [previous]);
};

const defaultFontSize = 24;
const selectedFontSize = 32;

const Label: FunctionComponent<{
  label: string;
  isSelected: boolean;
  onSelect: () => void;
  onDefaultLabelLayout: (width: number, height: number) => void;
}> = ({ label, isSelected, onSelect, onDefaultLabelLayout }) => {
  const style = useStyle();

  const [animatedState] = useState(() => {
    return {
      clock: new Animated.Clock(),
      finished: new Animated.Value(0),
      position: new Animated.Value<number>(
        isSelected ? selectedFontSize : defaultFontSize
      ),
      time: new Animated.Value(0),
      frameTime: new Animated.Value(0),
    };
  });

  const previous = usePreviousDiff();

  const [animatedSelected] = useState(
    () => new Animated.Value(isSelected ? 1 : 0)
  );

  useEffect(() => {
    if (isSelected) {
      animatedSelected.setValue(1);
    } else {
      animatedSelected.setValue(0);
    }
  }, [animatedSelected, isSelected]);

  const fontSize = useMemo(() => {
    return Animated.block([
      Animated.cond(
        Animated.not(Animated.eq(previous.diff(animatedSelected), 0)),
        [
          Animated.set(animatedState.finished, 0),
          Animated.set(animatedState.time, 0),
          Animated.set(animatedState.frameTime, 0),
          Animated.cond(
            Animated.not(Animated.clockRunning(animatedState.clock)),
            Animated.startClock(animatedState.clock)
          ),
        ]
      ),

      Animated.timing(animatedState.clock, animatedState, {
        duration: 150,
        toValue: Animated.cond(
          Animated.eq(animatedSelected, 0),
          defaultFontSize,
          selectedFontSize
        ),
        easing: EasingNode.out(EasingNode.circle),
      }),

      Animated.cond(animatedState.finished, [
        Animated.stopClock(animatedState.clock),
        Animated.set(
          animatedState.position,
          Animated.cond(
            Animated.eq(animatedSelected, 0),
            defaultFontSize,
            selectedFontSize
          )
        ),
      ]),

      previous.set(animatedSelected),
      animatedState.position,
    ]);
  }, [animatedSelected, animatedState, previous]);

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        onSelect();
      }}
    >
      {/*
          We need to calculate the width of default size label to scroll to the selected label.
          To achieve this, we render the label with opacity 0 and measure the width.
       */}
      <View
        onLayout={(e) => {
          onDefaultLabelLayout(
            e.nativeEvent.layout.width,
            e.nativeEvent.layout.height
          );
        }}
        style={StyleSheet.flatten([
          {
            position: "absolute",
            opacity: 0,
          },
        ])}
      >
        <Text
          style={StyleSheet.flatten([
            {
              fontSize: defaultFontSize,
              letterSpacing: 0.2,
              marginRight: 16,
            },
            style.flatten(["font-semibold"]),
          ])}
        >
          {label}
        </Text>
      </View>

      <Animated.Text
        style={StyleSheet.flatten([
          {
            fontSize,
            letterSpacing: 0.2,
            marginRight: 16,
            bottom: Animated.multiply(
              Animated.multiply(
                Animated.abs(Animated.sub(defaultFontSize, fontSize)),
                0.25
              ),
              -1
            ),
          },
          style.flatten(
            ["font-semibold", "color-platinum-200", "dark:color-platinum-300"],
            [
              isSelected && "font-bold",
              isSelected && "color-blue-400",
              isSelected && "dark:color-gray-10",
            ]
          ),
        ])}
      >
        {label}
      </Animated.Text>
    </TouchableWithoutFeedback>
  );
};
