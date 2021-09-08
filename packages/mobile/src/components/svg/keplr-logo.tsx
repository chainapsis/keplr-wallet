import React, { FunctionComponent } from "react";
import Svg, {
  Path,
  Defs,
  RadialGradient,
  Stop,
  LinearGradient,
} from "react-native-svg";

export const KeplrLogo: FunctionComponent<{
  width?: number | string;
  height?: number | string;
}> = ({ width = 298, height = 92 }) => {
  return (
    <Svg
      style={{
        width,
        height,
      }}
      viewBox="0 0 298 92"
    >
      <Path
        d="M69.095 0H17.817C8.377 0 .724 7.653.724 17.093V68.37c0 9.44 7.652 17.093 17.093 17.093h51.278c9.44 0 17.093-7.652 17.093-17.093V17.093C86.188 7.653 78.535 0 69.095 0z"
        fill="url(#prefix__paint0_radial)"
      />
      <Path
        d="M69.095 0H17.817C8.377 0 .724 7.653.724 17.093V68.37c0 9.44 7.652 17.093 17.093 17.093h51.278c9.44 0 17.093-7.652 17.093-17.093V17.093C86.188 7.653 78.535 0 69.095 0z"
        fill="url(#prefix__paint1_radial)"
        fillOpacity={0.68}
      />
      <Path
        d="M69.095 0H17.817C8.377 0 .724 7.653.724 17.093V68.37c0 9.44 7.652 17.093 17.093 17.093h51.278c9.44 0 17.093-7.652 17.093-17.093V17.093C86.188 7.653 78.535 0 69.095 0z"
        fill="url(#prefix__paint2_radial)"
        fillOpacity={0.2}
      />
      <Path
        d="M69.095 0H17.817C8.377 0 .724 7.653.724 17.093V68.37c0 9.44 7.652 17.093 17.093 17.093h51.278c9.44 0 17.093-7.652 17.093-17.093V17.093C86.188 7.653 78.535 0 69.095 0z"
        fill="url(#prefix__paint3_linear)"
        fillOpacity={0.03}
      />
      <Path
        d="M30.807 72.645V46.15l25.041 26.494h13.93v-.684l-28.8-30.169 26.579-28.63v-.342H53.54L30.807 38.117V12.82H19.526v59.825h11.281z"
        fill="#fff"
      />
      <Path
        d="M69.095 0H17.817C8.377 0 .724 7.653.724 17.093V68.37c0 9.44 7.652 17.093 17.093 17.093h51.278c9.44 0 17.093-7.652 17.093-17.093V17.093C86.188 7.653 78.535 0 69.095 0z"
        fill="url(#prefix__paint4_radial)"
      />
      <Path
        d="M69.095 0H17.817C8.377 0 .724 7.653.724 17.093V68.37c0 9.44 7.652 17.093 17.093 17.093h51.278c9.44 0 17.093-7.652 17.093-17.093V17.093C86.188 7.653 78.535 0 69.095 0z"
        fill="url(#prefix__paint5_radial)"
        fillOpacity={0.57}
      />
      <Path
        d="M69.095 0H17.817C8.377 0 .724 7.653.724 17.093V68.37c0 9.44 7.652 17.093 17.093 17.093h51.278c9.44 0 17.093-7.652 17.093-17.093V17.093C86.188 7.653 78.535 0 69.095 0z"
        fill="url(#prefix__paint6_radial)"
        fillOpacity={0.68}
      />
      <Path
        d="M69.095 0H17.817C8.377 0 .724 7.653.724 17.093V68.37c0 9.44 7.652 17.093 17.093 17.093h51.278c9.44 0 17.093-7.652 17.093-17.093V17.093C86.188 7.653 78.535 0 69.095 0z"
        fill="url(#prefix__paint7_radial)"
        fillOpacity={0.08}
      />
      <Path
        d="M69.095 0H17.817C8.377 0 .724 7.653.724 17.093V68.37c0 9.44 7.652 17.093 17.093 17.093h51.278c9.44 0 17.093-7.652 17.093-17.093V17.093C86.188 7.653 78.535 0 69.095 0z"
        fill="url(#prefix__paint8_linear)"
        fillOpacity={0.03}
      />
      <Path
        d="M30.807 72.645V46.15l25.041 26.494h13.93v-.684l-28.8-30.169 26.579-28.63v-.342H53.54L30.807 38.117V12.82H19.526v59.825h11.281z"
        fill="#fff"
      />
      <Path
        d="M113.737 72.184V45.812l24.858 26.372h13.829v-.68l-28.591-30.031 26.385-28.499v-.34h-13.914l-22.567 25.18v-25.18h-11.199v59.55h11.199zm57.899 1.276c6.447 0 13.489-2.297 17.986-6.806l-6.618-6.55c-2.46 2.467-7.381 3.913-11.199 3.913-7.381 0-11.793-3.743-12.471-8.933h32.663c.085-1.36.17-2.637.17-3.913 0-14.632-8.484-22.033-21.295-22.033-13.575 0-22.228 9.187-22.228 21.948 0 13.356 8.569 22.374 22.992 22.374zm10.435-26.968h-22.568c1.612-5.444 6.024-8.167 11.708-8.167 6.024 0 10.181 2.723 10.86 8.167zm24.896 44.918V67.25c3.054 4.678 9.417 6.125 13.914 6.125 13.404 0 21.125-9.869 21.125-22.119 0-12.335-8.569-21.948-21.465-21.948-4.751 0-10.265 1.957-13.574 6.72l-.679-5.784h-9.672V91.41h10.351zm12.811-28.159c-7.127 0-11.878-5.444-11.878-11.995 0-6.55 4.412-11.91 11.878-11.91s11.877 5.36 11.877 11.91-4.751 11.995-11.877 11.995zm37.622 8.933V12.719h-10.266v59.465H257.4zm18.024 0V50.065c0-7.826 5.005-10.634 10.435-10.634 3.394 0 5.345 1.106 7.466 2.723l4.666-9.018c-2.291-2.127-6.448-3.913-10.775-3.913-4.157 0-8.738.765-11.792 5.87l-.764-4.85h-9.587v41.94h10.351z"
        fill="#000"
      />
      <Defs>
        <RadialGradient
          id="prefix__paint0_radial"
          cx={0}
          cy={0}
          r={1}
          gradientUnits="userSpaceOnUse"
          gradientTransform="rotate(140.172 -39.54 8.676) scale(146.949 177.327)"
        >
          <Stop stopColor="#1973C8" />
          <Stop offset={1} stopColor="#0D25D1" />
        </RadialGradient>
        <RadialGradient
          id="prefix__paint1_radial"
          cx={0}
          cy={0}
          r={1}
          gradientUnits="userSpaceOnUse"
          gradientTransform="rotate(178.314 -40.355 -20.474) scale(91.8981 67.6819)"
        >
          <Stop stopColor="#5CA6EB" />
          <Stop offset={1} stopColor="#5CA6EB" stopOpacity={0.084} />
        </RadialGradient>
        <RadialGradient
          id="prefix__paint2_radial"
          cx={0}
          cy={0}
          r={1}
          gradientUnits="userSpaceOnUse"
          gradientTransform="matrix(-24.50407 42.54856 -63.78844 -36.7363 -74.623 5.53)"
        >
          <Stop stopColor="#fff" />
          <Stop offset={1} stopColor="#fff" stopOpacity={0.33} />
        </RadialGradient>
        <RadialGradient
          id="prefix__paint4_radial"
          cx={0}
          cy={0}
          r={1}
          gradientUnits="userSpaceOnUse"
          gradientTransform="matrix(147 0 0 147 78.383 9.366)"
        >
          <Stop stopColor="#2F80F2" />
          <Stop offset={1} stopColor="#A942B5" />
        </RadialGradient>
        <RadialGradient
          id="prefix__paint5_radial"
          cx={0}
          cy={0}
          r={1}
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(.724 1.836) scale(135.98)"
        >
          <Stop stopColor="#45F9DE" />
          <Stop offset={1} stopColor="#A942B5" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient
          id="prefix__paint6_radial"
          cx={0}
          cy={0}
          r={1}
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(86.188 85.464) scale(82.0832)"
        >
          <Stop stopColor="#E957C5" />
          <Stop offset={1} stopColor="#A942B5" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient
          id="prefix__paint7_radial"
          cx={0}
          cy={0}
          r={1}
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(43.456 42.732) scale(49.2718)"
        >
          <Stop stopOpacity={0.185} />
          <Stop offset={1} stopColor="#101010" />
        </RadialGradient>
        <LinearGradient
          id="prefix__paint3_linear"
          x1={81.263}
          y1={50.395}
          x2={0.724}
          y2={0}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#fff" stopOpacity={0.185} />
          <Stop offset={1} stopColor="#fff" />
        </LinearGradient>
        <LinearGradient
          id="prefix__paint8_linear"
          x1={81.263}
          y1={50.395}
          x2={0.724}
          y2={0}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#fff" stopOpacity={0.185} />
          <Stop offset={1} stopColor="#fff" />
        </LinearGradient>
      </Defs>
    </Svg>
  );
};
