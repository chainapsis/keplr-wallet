import React, {
  FunctionComponent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ScrollViewProps,
  View,
  Animated as NativeAnimated,
} from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, { Easing } from "react-native-reanimated";
import { stableSort } from "../../utils/stable-sort";
import { useStyle } from "../../styles";

interface MemoizedItem<Item extends { key: string }> {
  item: Item;
  virtualIndex: Animated.Value<number>;
}

export interface FixedHeightSortableListProps<Item extends { key: string }>
  extends ScrollViewProps {
  itemHeight: number;
  data: ReadonlyArray<Item>;
  renderItem: (
    item: Item,
    anims: {
      readonly isDragging: Animated.Value<number>;
      readonly onGestureEvent: (...args: any[]) => void;
    }
  ) => React.ReactElement | null;
  onDragEnd: (sortedKeys: string[]) => void;
  dividerIndex?: number;
  delegateOnGestureEventToItemView?: boolean;

  gapTop?: number;
  gapBottom?: number;
}

/**
 * TODO: Translate to English.
 *
 * 동일한 높이를 가진 Item들을 가지는 ScrollView 안의 list를 구현한다.
 * 이 list는 터치를 통해서 drag and sort 할 수 있다.
 *
 * 리액트 네이티브의 한계로 리렌더링이 일어나면 끊기는 현상이 일어나서 부드러운 애니메이션이 불가능하다.
 * 그렇기 때문에 이 컴포넌트의 내부 구현은 최대한 리렌더링을 막는 방향으로 구현되어 있다.
 * 사용하는 쪽에서도 리렌더링이 최대한 발생하지 않도록 약간 신경을 써야한다.
 * data prop을 통해서 각 Item으로 전달될 prop을 반환할 수 있다.
 * 그 prop들은 얇은 비교를 통해서 리렌더링을 수행할 지 결정된다.
 * 그러므로 각 data들은 얇은 비교만으로 구분할 수 있도록 primitive type만을 사용하는게 추천된다.
 *
 * 이 컴포넌트는 사실 chain list screen을 구현하기 위해서 만들어진 것이다.
 * dividerIndex prop은 위의 스크린에서 필요한 행동을 구현하기 위해서 존재한다.
 * dividerIndex의 위쪽에 있는 Item들과 아래쪽에 있는 Item들을 서로의 구역으로 이동할 수 없다.
 * 하지만 리렌더링을 막기 위해서 dividerIndex는 reanimated의 value로 구현되어 있고
 * prop이 변하더라도 reanimated의 프로세스로 value를 변경하도록 요청한다.
 * 이 요청은 동기적으로 이루어지지 않는다.
 * 일반적인 유저 행동에서는 문제가 되지 않지만 비동기적으로 작동되기 때문에
 * 유저가 이상하게 행동하면 버그가 발생할 수 있다. 이건 현재로서는 방법이 없다.
 *
 * NOTE: renderItem prop을 통해서 Item을 렌더링할 컴포넌트를 전달받을 수 있다.
 *       하지만 리렌더링을 컨트롤하기 위해서 renderItem prop을 사용하는 쪽에서 useCallback 등을 통해서
 *       memoization하는 것을 강제하는 것보다 더 간편하게 사용할 수 있도록 하기 위해서
 *       renderItem에 대해서는 리렌더링 검사를 하지 않는다.
 *       그러므로 renderItem의 변화를 이 컴포넌트에서 감지할 수 없다.
 *       renderItem이 변경되더라도 data를 통해서 전달된 prop이 변하지 않는다면 리렌더링이 되지 않기 때문에 적용되지 않는다.
 *       이건 버그가 아니라 의도된 행동이다.
 *       일반적으로 renderItem의 행동이 변경될 일은 없다. 그러므로 이러한 한계를 무시한 것이다.
 * @param props
 * @constructor
 */
export function FixedHeightSortableList<Item extends { key: string }>(
  props: FixedHeightSortableListProps<Item>
) {
  const {
    data,
    renderItem,
    itemHeight,
    onDragEnd,
    dividerIndex = -1,
    delegateOnGestureEventToItemView = false,
    gapTop = 0,
    gapBottom = 0,
    indicatorStyle,
    ...scrollViewProps
  } = props;

  const style = useStyle();

  // It is hard to handle multi touch.
  // So, prevent multi touch by using this.
  const [draggingGlobalLock] = useState(() => new Animated.Value(0));

  const [virtualDividerIndex] = useState(
    () => new Animated.Value(dividerIndex)
  );

  useEffect(() => {
    virtualDividerIndex.setValue(dividerIndex);
  }, [dividerIndex, virtualDividerIndex]);

  const memoizationMap = useRef<
    Map<
      string,
      {
        virtualIndex: Animated.Value<number>;
      }
    >
  >(new Map());

  const memoizedItems = useMemo<MemoizedItem<Item>[]>(() => {
    const usedKeys = new Map<string, boolean>();

    const result = data
      .slice()
      .map((item, index) => {
        return {
          item,
          index,
        };
      })
      .sort((a, b) => {
        // Sort by key to maintain rendering order.
        return a.item.key < b.item.key ? -1 : 1;
      })
      .map(({ item, index }) => {
        usedKeys.set(item.key, true);

        // Use memoized data (with memoized animated value) to reduce rendering.
        let memoizedData = memoizationMap.current.get(item.key);
        if (memoizedData) {
          memoizedData.virtualIndex.setValue(index);
        } else {
          memoizedData = {
            virtualIndex: new Animated.Value(index),
          };
          memoizationMap.current.set(item.key, memoizedData);
        }

        return {
          item,
          virtualIndex: memoizedData.virtualIndex,
        };
      });

    // Remove unused memoized data
    for (const key of memoizationMap.current.keys()) {
      if (!usedKeys.get(key)) {
        usedKeys.delete(key);
      }
    }

    return result;
  }, [data]);

  const onDragEndRef = useRef(onDragEnd);
  onDragEndRef.current = onDragEnd;

  const procMemoization = useRef<
    | {
        onItemMove: any;
        onDragEnd: any;
        keys: string;
      }
    | undefined
  >(undefined);

  const procs = useMemo(() => {
    const keys = memoizedItems.map((item) => item.item.key).join(",");

    if (procMemoization.current && procMemoization.current.keys === keys) {
      return {
        onItemMove: procMemoization.current.onItemMove,
        onDragEnd: procMemoization.current.onDragEnd,
      };
    } else {
      const onItemMoveProc = Animated.proc(
        (before: Animated.Value<number>, after: Animated.Value<number>) =>
          Animated.block([
            ...memoizedItems.map((item) => {
              return [
                Animated.cond(Animated.not(Animated.eq(before, after)), [
                  Animated.cond(
                    Animated.eq(before, item.virtualIndex),
                    [
                      Animated.set(item.virtualIndex, after),
                      Animated.cond(Animated.lessThan(item.virtualIndex, 0), [
                        Animated.set(item.virtualIndex, 0),
                      ]),
                      Animated.cond(
                        Animated.greaterOrEq(
                          item.virtualIndex,
                          memoizedItems.length
                        ),
                        [
                          Animated.set(
                            item.virtualIndex,
                            memoizedItems.length - 1
                          ),
                        ]
                      ),
                    ],
                    [
                      Animated.cond(
                        Animated.lessThan(Animated.sub(before, after), 0),
                        [
                          Animated.cond(
                            Animated.and(
                              Animated.greaterThan(item.virtualIndex, before),
                              Animated.lessOrEq(item.virtualIndex, after)
                            ),
                            [
                              Animated.set(
                                item.virtualIndex,
                                Animated.sub(item.virtualIndex, 1)
                              ),
                            ]
                          ),
                        ],
                        [
                          Animated.cond(
                            Animated.and(
                              Animated.lessThan(item.virtualIndex, before),
                              Animated.greaterOrEq(item.virtualIndex, after)
                            ),
                            [
                              Animated.set(
                                item.virtualIndex,
                                Animated.add(item.virtualIndex, 1)
                              ),
                            ]
                          ),
                        ]
                      ),
                    ]
                  ),
                ]),
              ];
            }),
          ])
      );

      const onDragEndCallback = (indexs: readonly number[]) => {
        const keysWithIndex = memoizedItems.map((item, i) => {
          return {
            key: item.item.key,
            index: indexs[i],
          };
        });

        const sorted = stableSort(keysWithIndex, (a, b) => {
          if (a.index === b.index) {
            return 0;
          }

          return a.index < b.index ? -1 : 1;
        }).map(({ key }) => key);

        onDragEndRef.current(sorted);
      };

      const onDragEndProc = Animated.proc(() =>
        Animated.block([
          Animated.call(
            memoizedItems.map((item) => item.virtualIndex),
            onDragEndCallback
          ),
        ])
      );
      procMemoization.current = {
        keys,
        onItemMove: onItemMoveProc,
        onDragEnd: onDragEndProc,
      };
      return {
        onItemMove: procMemoization.current.onItemMove,
        onDragEnd: procMemoization.current.onDragEnd,
      };
    }
  }, [memoizedItems]);

  return (
    <NativeAnimated.ScrollView
      indicatorStyle={
        indicatorStyle ?? style.theme === "dark" ? "white" : "black"
      }
      {...scrollViewProps}
    >
      <View
        style={{
          height: itemHeight * memoizedItems.length + gapTop + gapBottom,
        }}
      />
      {memoizedItems.map((memoizedItem) => {
        const { key, ...rest } = memoizedItem.item;

        return (
          <MemoizedChildrenRenderer
            key={key}
            {...rest}
            itemHeight={itemHeight}
            procOnItemMove={procs.onItemMove}
            procOnDragEnd={procs.onDragEnd}
            delegateOnGestureEventToItemView={delegateOnGestureEventToItemView}
            gapTop={gapTop}
          >
            <FixedHeightSortableListItem
              itemHeight={itemHeight}
              procOnItemMove={procs.onItemMove}
              procOnDragEnd={procs.onDragEnd}
              delegateOnGestureEventToItemView={
                delegateOnGestureEventToItemView
              }
              gapTop={gapTop}
              // Belows no need to be under `MemoizedChildrenRenderer`
              virtualIndex={memoizedItem.virtualIndex}
              virtualDividerIndex={virtualDividerIndex}
              draggingGlobalLock={draggingGlobalLock}
              renderItem={renderItem}
              item={memoizedItem.item}
            />
          </MemoizedChildrenRenderer>
        );
      })}
    </NativeAnimated.ScrollView>
  );
}

// eslint-disable-next-line react/display-name
const MemoizedChildrenRenderer: FunctionComponent<any> = React.memo((props) => {
  const { children } = props;

  return children;
});

const usePreviousDiff = (initialValue: number) => {
  const [previous] = useState(() => new Animated.Value<number>(initialValue));

  return useMemo(() => {
    return {
      set: (value: Animated.Adaptable<number>) => Animated.set(previous, value),
      diff: (value: Animated.Adaptable<number>) =>
        Animated.cond(
          Animated.defined(previous),
          Animated.sub(value, previous),
          value
        ),
      previous,
    };
  }, [previous]);
};

const FixedHeightSortableListItem: FunctionComponent<{
  itemHeight: number;
  virtualIndex: Animated.Value<number>;
  virtualDividerIndex: Animated.Value<number>;
  draggingGlobalLock: Animated.Value<number>;
  procOnItemMove: any;
  procOnDragEnd: any;
  delegateOnGestureEventToItemView: boolean;

  item: any;
  renderItem: FixedHeightSortableListProps<any>["renderItem"];
  gapTop: number;
}> = ({
  itemHeight,
  virtualIndex,
  virtualDividerIndex,
  draggingGlobalLock,
  procOnItemMove,
  procOnDragEnd,
  delegateOnGestureEventToItemView,
  item,
  renderItem,
  gapTop,
}) => {
  const [animatedState] = useState(() => {
    return {
      clock: new Animated.Clock(),
      finished: new Animated.Value(0),
      position: new Animated.Value<number>(undefined),
      time: new Animated.Value(0),
      frameTime: new Animated.Value(0),
    };
  });

  const [isDragging] = useState(() => new Animated.Value(0));
  const [zIndexAdditionOnTransition] = useState(() => new Animated.Value(0));
  const [currentDraggingIndex] = useState(() => new Animated.Value(0));

  const translateYDiff = usePreviousDiff(0);
  const virtualIndexDiff = usePreviousDiff(-1);

  const onGestureEvent = useMemo(() => {
    return Animated.event([
      {
        nativeEvent: ({
          translationY,
          state,
        }: {
          translationY: number;
          state: number;
        }) => {
          return Animated.block([
            Animated.cond(
              // Check that the state is BEGEN or ACTIVE.
              Animated.or(Animated.eq(state, 2), Animated.eq(state, 4)),
              [
                Animated.cond(
                  Animated.and(
                    Animated.eq(isDragging, 0),
                    Animated.and(
                      Animated.not(Animated.clockRunning(animatedState.clock)),
                      Animated.eq(draggingGlobalLock, 0)
                    )
                  ),
                  [
                    Animated.debug("start dragging", virtualIndex),
                    Animated.set(isDragging, 1),
                    Animated.set(draggingGlobalLock, 1),
                    Animated.set(zIndexAdditionOnTransition, 10000000),
                    Animated.set(currentDraggingIndex, virtualIndex),
                  ]
                ),
              ],
              [
                Animated.cond(Animated.greaterThan(isDragging, 0), [
                  Animated.debug("stop dragging", virtualIndex),
                  Animated.set(isDragging, 0),
                  Animated.set(draggingGlobalLock, 0),
                  Animated.set(translateYDiff.previous, 0),
                  Animated.set(animatedState.finished, 0),
                  Animated.set(animatedState.time, 0),
                  Animated.set(animatedState.frameTime, 0),
                  Animated.cond(
                    Animated.not(Animated.clockRunning(animatedState.clock)),
                    Animated.startClock(animatedState.clock)
                  ),
                  procOnDragEnd(),
                ]),
              ]
            ),
            Animated.cond(
              Animated.greaterThan(isDragging, 0),
              [
                Animated.cond(
                  Animated.eq(translateYDiff.previous, 0),
                  [
                    Animated.set(
                      animatedState.position,
                      Animated.add(animatedState.position, translationY)
                    ),
                  ],
                  [
                    Animated.set(
                      animatedState.position,
                      Animated.add(
                        animatedState.position,
                        translateYDiff.diff(translationY)
                      )
                    ),
                  ]
                ),
                translateYDiff.set(translationY),
              ],
              [Animated.set(translateYDiff.previous, 0)]
            ),
          ]);
        },
      },
    ]);
  }, [
    animatedState.clock,
    animatedState.finished,
    animatedState.frameTime,
    animatedState.position,
    animatedState.time,
    currentDraggingIndex,
    draggingGlobalLock,
    isDragging,
    procOnDragEnd,
    translateYDiff,
    virtualIndex,
    zIndexAdditionOnTransition,
  ]);

  const positionY = useMemo(() => {
    return Animated.block([
      Animated.cond(Animated.not(Animated.defined(animatedState.position)), [
        Animated.set(
          animatedState.position,
          Animated.add(Animated.multiply(itemHeight, virtualIndex), gapTop)
        ),
      ]),

      Animated.cond(
        Animated.eq(isDragging, 0),
        [
          Animated.cond(Animated.greaterOrEq(virtualIndexDiff.previous, 0), [
            Animated.cond(
              Animated.not(Animated.eq(virtualIndexDiff.diff(virtualIndex), 0)),
              [
                Animated.set(
                  zIndexAdditionOnTransition,
                  Animated.multiply(
                    10000,
                    Animated.abs(virtualIndexDiff.diff(virtualIndex))
                  )
                ),
                Animated.set(animatedState.finished, 0),
                Animated.set(animatedState.time, 0),
                Animated.set(animatedState.frameTime, 0),
                Animated.cond(
                  Animated.not(Animated.clockRunning(animatedState.clock)),
                  Animated.startClock(animatedState.clock)
                ),
              ]
            ),
          ]),

          Animated.timing(animatedState.clock, animatedState, {
            duration: 350,
            toValue: Animated.add(
              Animated.multiply(itemHeight, virtualIndex),
              gapTop
            ),
            easing: Easing.out(Easing.cubic),
          }),

          Animated.cond(animatedState.finished, [
            Animated.stopClock(animatedState.clock),
            Animated.set(zIndexAdditionOnTransition, 0),
          ]),
        ],
        [
          Animated.set(
            currentDraggingIndex,
            Animated.floor(
              Animated.divide(
                Animated.add(
                  Animated.sub(animatedState.position, gapTop),
                  itemHeight / 2
                ),
                itemHeight
              )
            )
          ),
          Animated.cond(Animated.greaterThan(virtualDividerIndex, 0), [
            Animated.cond(
              Animated.lessThan(virtualIndex, virtualDividerIndex),
              [
                Animated.cond(
                  Animated.greaterOrEq(
                    currentDraggingIndex,
                    virtualDividerIndex
                  ),
                  [
                    Animated.set(
                      currentDraggingIndex,
                      Animated.sub(virtualDividerIndex, 1)
                    ),
                  ]
                ),
              ],
              [
                Animated.cond(
                  Animated.lessThan(currentDraggingIndex, virtualDividerIndex),
                  [Animated.set(currentDraggingIndex, virtualDividerIndex)]
                ),
              ]
            ),
          ]),
          Animated.cond(
            Animated.not(Animated.eq(virtualIndex, currentDraggingIndex)),
            [procOnItemMove(virtualIndex, currentDraggingIndex)]
          ),
        ]
      ),

      virtualIndexDiff.set(virtualIndex),
      animatedState.position,
    ]);
  }, [
    animatedState,
    currentDraggingIndex,
    gapTop,
    isDragging,
    itemHeight,
    procOnItemMove,
    virtualDividerIndex,
    virtualIndex,
    virtualIndexDiff,
    zIndexAdditionOnTransition,
  ]);

  return (
    <PanGestureHandler
      enabled={!delegateOnGestureEventToItemView}
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onGestureEvent}
    >
      <Animated.View
        style={{
          position: "absolute",
          height: itemHeight,
          width: "100%",
          top: positionY,
          zIndex: Animated.add(virtualIndex, zIndexAdditionOnTransition),
        }}
      >
        {renderItem(item, {
          isDragging,
          onGestureEvent,
        })}
      </Animated.View>
    </PanGestureHandler>
  );
};
