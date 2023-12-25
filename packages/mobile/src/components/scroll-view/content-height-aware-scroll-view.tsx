import React, {forwardRef} from 'react';
import {ScrollView, ScrollViewProps} from 'react-native';

// 스크롤 뷰인데 컨텐츠의 높이를 감안해서 스크롤이 필요가 없다면
// scroll 기능 자체를 disable한다.
// 레이아웃의 문제로 작은 화면에서는 스크롤이 필요할 수 있을때
// 그냥 스크롤 뷰를 사용하면 일반적으로 스크롤이 필요없는데도
// ios에서 bounce가 생기거나 안드로이드에서 scoll end effect가 생기는 문제가 있다.
// 이런 문제를 해결하고 싶을때 제한적으로 사용한다.
// NOTE: scroll view 자체와 그 content의 size를 알아내기 전에는 scroll이 disable 된다.
//       즉 처음에 scroll이 disable로 시작해서 약간의 시간이 지나야 enable이 되는 단점이 있음.
export const ContentHeightAwareScrollView = forwardRef<
  ScrollView,
  ScrollViewProps
>((props, ref) => {
  const {children, onLayout, onContentSizeChange, scrollEnabled, ...rest} =
    props;

  const [layoutSize, setLayoutSize] = React.useState<{
    width: number;
    height: number;
  } | null>(null);
  const [contentSize, setContentSize] = React.useState<{
    width: number;
    height: number;
  } | null>(null);

  return (
    <ScrollView
      {...rest}
      ref={ref}
      scrollEnabled={(() => {
        // prop을 통해서 명시되어 있다면 그것을 반환한다.
        if (scrollEnabled != null) {
          return scrollEnabled;
        }

        if (!layoutSize || !contentSize) {
          return false;
        }

        return (
          layoutSize.height < contentSize.height ||
          layoutSize.width < contentSize.width
        );
      })()}
      onLayout={e => {
        if (onLayout) {
          onLayout(e);
        }

        setLayoutSize({
          width: e.nativeEvent.layout.width,
          height: e.nativeEvent.layout.height,
        });
      }}
      onContentSizeChange={(w, h) => {
        if (onContentSizeChange) {
          onContentSizeChange(w, h);
        }

        setContentSize({
          width: w,
          height: h,
        });
      }}>
      {children}
    </ScrollView>
  );
});
