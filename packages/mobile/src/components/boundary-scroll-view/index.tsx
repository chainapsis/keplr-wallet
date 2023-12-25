import React, {
  FunctionComponent,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {LayoutRectangle, ScrollView, ScrollViewProps, View} from 'react-native';
import {Box, BoxProps} from '../box';

interface BoundaryScrollViewContextType {
  ref: React.RefObject<ScrollView>;
  layout: LayoutRectangle | null;
  scrollOffset: number;
}

const BoundaryScrollViewContext =
  React.createContext<BoundaryScrollViewContextType | null>(null);

export const BoundaryScrollView: FunctionComponent<ScrollViewProps> = ({
  children,
  ...scrollViewProps
}) => {
  const [layout, setLayout] = useState<LayoutRectangle | null>(null);
  const [scrollOffset, setScrollOffset] = useState(0);

  const ref = useRef<ScrollView>(null);

  return (
    <ScrollView
      indicatorStyle="white"
      scrollEventThrottle={30}
      {...scrollViewProps}
      ref={ref}
      onLayout={e => {
        setLayout(e.nativeEvent.layout);
        if (scrollViewProps.onLayout) {
          scrollViewProps.onLayout(e);
        }
      }}
      onScroll={e => {
        setScrollOffset(e.nativeEvent.contentOffset.y);
        if (scrollViewProps.onScroll) {
          scrollViewProps.onScroll(e);
        }
      }}>
      <BoundaryScrollViewContext.Provider
        value={{
          layout,
          scrollOffset,
          ref,
        }}>
        {children}
      </BoundaryScrollViewContext.Provider>
    </ScrollView>
  );
};

export const BoundaryScrollViewBoundary: FunctionComponent<
  BoxProps & {
    itemHeight: number;
    items: React.ReactNode[];
    initialNumItemsToRender?: number;
    floodNumItemsToRender?: number;
    gap: number;
  }
> = ({
  items,
  itemHeight,
  initialNumItemsToRender = 14,
  floodNumItemsToRender = 6,
  gap,
  ...boxProps
}) => {
  const {
    layout,
    scrollOffset,
    ref: scrollViewRef,
  } = useBoundaryScrollViewInternal();
  const startPointRef = useRef<View | null>(null);

  const [renderIndex, setRenderIndex] = React.useState<[number, number]>([
    0,
    initialNumItemsToRender,
  ]);
  const [mockTopViewHeight, setMockTopViewHeight] = React.useState(0);
  const [mockBottomViewHeight, setMockBottomViewHeight] = React.useState(
    Math.max(
      0,
      (items.length - renderIndex[1]) * itemHeight +
        (items.length - renderIndex[1] - 1) * gap,
    ),
  );

  useEffect(() => {
    if (layout && scrollViewRef.current && startPointRef.current) {
      startPointRef.current.measureLayout(
        scrollViewRef.current.getScrollableNode(),
        (_left: number, top: number, _width: number, _height: number) => {
          const boundaryOffsetStartY = Math.max(0, scrollOffset);
          const boundaryOffsetEndY =
            Math.max(0, scrollOffset) + layout.height - top;
          const startIndex = Math.min(
            Math.max(
              Math.floor(boundaryOffsetStartY / (itemHeight + gap)) -
                floodNumItemsToRender,
              0,
            ),
            items.length - 1,
          );
          const endIndex = Math.min(
            Math.ceil(boundaryOffsetEndY / (itemHeight + gap)) +
              floodNumItemsToRender,
            items.length,
          );
          setRenderIndex([startIndex, endIndex]);
          setMockTopViewHeight(startIndex * (itemHeight + gap));
          setMockBottomViewHeight(
            Math.max(
              0,
              (items.length - endIndex) * itemHeight +
                (items.length - endIndex - 1) * gap,
            ),
          );
        },
      );
    }
  }, [
    layout,
    scrollViewRef,
    scrollOffset,
    floodNumItemsToRender,
    itemHeight,
    gap,
    items.length,
  ]);

  const itemsRenderIndexKey = useRef(0);
  itemsRenderIndexKey.current = 0;
  return (
    <React.Fragment>
      <View ref={startPointRef} />
      <Box {...boxProps}>
        <View
          style={{
            height: mockTopViewHeight,
          }}
        />
        {items.map((item, index) => {
          if (index >= renderIndex[0] && index < renderIndex[1]) {
            const key = itemsRenderIndexKey.current;
            itemsRenderIndexKey.current++;
            return (
              <React.Fragment key={key}>
                {item}
                {index !== items.length - 1 ? (
                  <View style={{height: gap}} />
                ) : null}
              </React.Fragment>
            );
          }
          return null;
        })}
        <View
          style={{
            height: mockBottomViewHeight,
          }}
        />
      </Box>
    </React.Fragment>
  );
};

export const useBoundaryScrollViewInternal = () => {
  const context = useContext(BoundaryScrollViewContext);
  if (!context) {
    throw new Error(
      'You must use `BoundaryScrollViewBoundary` under `BoundaryScrollView`',
    );
  }
  return context;
};
