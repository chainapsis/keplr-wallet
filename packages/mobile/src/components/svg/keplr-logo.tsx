import React, { FunctionComponent } from "react";
import Svg, { Path, Defs, Rect, Stop, LinearGradient } from "react-native-svg";

export const KeplrLogo: FunctionComponent<{
  width?: number | string;
  height?: number | string;
}> = ({ width = 284, height = 96 }) => {
  return (
    <Svg
      style={{
        width,
        height,
      }}
      viewBox="0 0 284 96"
    >
      <Path
        d="M127.33 73.852v-22.4l21.114 22.4h11.746v-.578l-24.285-25.507 22.411-24.205v-.29h-11.818L127.33 44.662V23.272h-9.512v50.579h9.512zm49.177 1.084c5.477 0 11.458-1.951 15.277-5.78l-5.621-5.564c-2.09 2.095-6.269 3.323-9.512 3.323-6.269 0-10.016-3.179-10.593-7.587h27.744c.072-1.156.144-2.24.144-3.323 0-12.428-7.206-18.715-18.087-18.715-11.53 0-18.88 7.804-18.88 18.642 0 11.345 7.278 19.004 19.528 19.004zm8.864-22.905h-19.168c1.369-4.625 5.116-6.937 9.944-6.937 5.116 0 8.647 2.312 9.224 6.937zm21.145 38.15v-20.52c2.594 3.974 7.999 5.203 11.818 5.203 11.386 0 17.943-8.382 17.943-18.787 0-10.477-7.278-18.642-18.231-18.642-4.036 0-8.719 1.662-11.53 5.708l-.576-4.913h-8.215v51.952h8.791zm10.881-23.916c-6.053 0-10.088-4.624-10.088-10.188 0-5.564 3.747-10.116 10.088-10.116 6.342 0 10.089 4.552 10.089 10.116s-4.036 10.188-10.089 10.188zm31.955 7.587V23.345h-8.719v50.507h8.719zm15.309 0V55.065c0-6.647 4.251-9.032 8.863-9.032 2.882 0 4.54.94 6.341 2.313l3.964-7.66c-1.946-1.806-5.477-3.323-9.152-3.323-3.531 0-7.422.65-10.016 4.985l-.649-4.118h-8.143v35.622h8.792z"
        fill="#000"
      />
      <Rect
        x={96}
        width={96}
        height={96}
        rx={23.273}
        transform="rotate(90 96 0)"
        fill="url(#prefix__paint0_linear)"
      />
      <Rect
        opacity={0.9}
        x={96}
        width={96}
        height={96}
        rx={23.273}
        transform="rotate(90 96 0)"
        fill="url(#prefix__paint1_linear)"
      />
      <Rect
        opacity={0.9}
        width={96}
        height={96}
        rx={23.273}
        fill="url(#prefix__paint2_linear)"
      />
      <Path
        d="M39.059 73.07V50.865L59.93 73.07h11.611v-.573L47.536 47.212l22.153-23.996v-.286H58.007L39.059 44.132V22.93h-9.403v50.14h9.403z"
        fill="url(#prefix__paint3_linear)"
      />
      <Defs>
        <LinearGradient
          id="prefix__paint0_linear"
          x1={148.739}
          y1={-3.363}
          x2={93.096}
          y2={106.701}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset={0.211} stopColor="#457CD6" />
          <Stop offset={0.682} stopColor="#58ADE9" />
          <Stop offset={0.943} stopColor="#71C4FF" />
        </LinearGradient>
        <LinearGradient
          id="prefix__paint1_linear"
          x1={99.975}
          y1={54.879}
          x2={181.911}
          y2={84.688}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#457CD6" stopOpacity={0} />
          <Stop offset={0.286} stopColor="#58ADE9" stopOpacity={0} />
          <Stop offset={0.571} stopColor="#AF75EA" stopOpacity={0.3} />
          <Stop offset={1} stopColor="#8557E8" stopOpacity={0.8} />
        </LinearGradient>
        <LinearGradient
          id="prefix__paint2_linear"
          x1={0}
          y1={-1.987}
          x2={96}
          y2={92.484}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset={0.069} stopColor="#457CD6" stopOpacity={0} />
          <Stop offset={0.286} stopColor="#58ADE9" stopOpacity={0} />
          <Stop offset={0.466} stopColor="#B594FB" stopOpacity={0} />
          <Stop offset={0.634} stopColor="#D483FB" stopOpacity={0.2} />
          <Stop offset={0.899} stopColor="#BE6CFF" stopOpacity={0.8} />
          <Stop offset={1} stopColor="#B969F8" stopOpacity={0.85} />
        </LinearGradient>
        <LinearGradient
          id="prefix__paint3_linear"
          x1={50.599}
          y1={22.93}
          x2={50.599}
          y2={73.07}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#fff" />
        </LinearGradient>
      </Defs>
    </Svg>
  );
};
