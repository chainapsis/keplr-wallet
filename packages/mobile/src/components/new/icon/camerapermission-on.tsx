import React, { FunctionComponent } from "react";
import Svg, {
  Path,
  G,
  Mask,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";
/* SVGR has dropped some elements not supported by react-native-svg: filter */

export const CameraPermissionOnIcon: FunctionComponent = (props) => {
  return (
    <Svg width={102} height={116} viewBox="0 0 102 116" fill="none" {...props}>
      <Path
        d="M52.592 20.61h-9.948v-.988a3.657 3.657 0 00-3.657-3.657H21.041a3.657 3.657 0 00-3.657 3.657v.987H7.445A5.445 5.445 0 002 26.055V51.34a5.445 5.445 0 005.445 5.445h45.147a5.445 5.445 0 005.445-5.445V26.055a5.445 5.445 0 00-5.445-5.446z"
        fill="#30239C"
      />
      <G filter="url(#filter0_bd_1784_6970)">
        <Mask id="a" fill="#fff">
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M24.991 20.662a2.42 2.42 0 11-4.84 0 2.42 2.42 0 014.84 0zm14.957 17.849c0 5.715-4.633 10.348-10.348 10.348-5.715 0-10.348-4.633-10.348-10.348 0-5.715 4.633-10.348 10.348-10.348 5.715 0 10.348 4.633 10.348 10.348z"
          />
        </Mask>
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M24.991 20.662a2.42 2.42 0 11-4.84 0 2.42 2.42 0 014.84 0zm14.957 17.849c0 5.715-4.633 10.348-10.348 10.348-5.715 0-10.348-4.633-10.348-10.348 0-5.715 4.633-10.348 10.348-10.348 5.715 0 10.348 4.633 10.348 10.348z"
          fill="url(#paint0_linear_1784_6970)"
        />
        <Path
          d="M22.571 23.794a3.132 3.132 0 003.132-3.132h-1.424c0 .944-.764 1.709-1.708 1.709v1.423zm-3.132-3.132a3.132 3.132 0 003.132 3.132v-1.423a1.708 1.708 0 01-1.708-1.709h-1.424zm3.132-3.132a3.132 3.132 0 00-3.132 3.132h1.424c0-.943.765-1.708 1.708-1.708V17.53zm3.132 3.132a3.132 3.132 0 00-3.132-3.132v1.424c.944 0 1.708.765 1.708 1.708h1.424zM29.6 49.571c6.108 0 11.06-4.952 11.06-11.06h-1.424a9.636 9.636 0 01-9.636 9.636v1.424zM18.54 38.51c0 6.108 4.952 11.06 11.06 11.06v-1.424a9.636 9.636 0 01-9.636-9.636h-1.423zM29.6 27.45c-6.108 0-11.06 4.952-11.06 11.06h1.424a9.636 9.636 0 019.636-9.636V27.45zm11.06 11.06c0-6.108-4.952-11.06-11.06-11.06v1.424a9.636 9.636 0 019.636 9.636h1.424z"
          fill="url(#paint1_linear_1784_6970)"
          mask="url(#a)"
        />
      </G>
      <G filter="url(#filter1_bd_1784_6970)" shapeRendering="crispEdges">
        <Path
          d="M52.235 52.472H31.913c-7.602 0-13.764 6.162-13.764 13.764C18.149 73.838 24.31 80 31.913 80h20.322C59.837 80 66 73.838 66 66.237c0-7.602-6.163-13.764-13.765-13.764z"
          fill="url(#paint2_linear_1784_6970)"
        />
        <Path
          d="M31.913 52.828h20.322c7.406 0 13.41 6.003 13.41 13.408 0 7.405-6.004 13.409-13.41 13.409H31.913c-7.405 0-13.408-6.004-13.408-13.409 0-7.405 6.003-13.408 13.408-13.408z"
          stroke="url(#paint3_linear_1784_6970)"
          strokeWidth={0.711802}
        />
      </G>
      <Path
        d="M52.458 78.416c6.727 0 12.18-5.453 12.18-12.18 0-6.726-5.453-12.18-12.18-12.18-6.727 0-12.18 5.454-12.18 12.18 0 6.727 5.453 12.18 12.18 12.18z"
        fill="#30239C"
      />
      <G filter="url(#filter2_bd_1784_6970)" shapeRendering="crispEdges">
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M60.054 61.397a2.224 2.224 0 010 3.145l-8.043 8.044a2.225 2.225 0 01-3.147-.002l-4.013-4.022A2.224 2.224 0 0148 65.42l2.439 2.445 6.469-6.468a2.224 2.224 0 013.145 0z"
          fill="url(#paint4_linear_1784_6970)"
        />
        <Path
          d="M50.188 68.117l.252.252.252-.252 6.468-6.469a1.868 1.868 0 112.643 2.643l-8.043 8.043a1.868 1.868 0 01-2.645-.001l-4.012-4.022a1.868 1.868 0 112.645-2.64l2.44 2.446z"
          stroke="url(#paint5_linear_1784_6970)"
          strokeWidth={0.711802}
        />
      </G>
      <Defs>
        <LinearGradient
          id="paint0_linear_1784_6970"
          x1={8.99776}
          y1={9.05402}
          x2={78.6498}
          y2={33.1026}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#8566FF" stopOpacity={0.7} />
          <Stop offset={0.394001} stopColor="#8566FF" stopOpacity={0.7} />
          <Stop offset={0.626154} stopColor="#5D34FF" stopOpacity={0.5} />
          <Stop offset={0.752365} stopColor="#5D34FF" stopOpacity={0.3} />
        </LinearGradient>
        <LinearGradient
          id="paint1_linear_1784_6970"
          x1={10.851}
          y1={10.263}
          x2={49.2949}
          y2={61.604}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset={0.110728} stopColor="#AF9BFD" />
          <Stop offset={0.56731} stopColor="#5F38FB" stopOpacity={0} />
          <Stop offset={0.847569} stopColor="#6C47FF" />
        </LinearGradient>
        <LinearGradient
          id="paint2_linear_1784_6970"
          x1={-20.0278}
          y1={39.2256}
          x2={141.54}
          y2={89.4766}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#8566FF" stopOpacity={0.7} />
          <Stop offset={0.394001} stopColor="#8566FF" stopOpacity={0.7} />
          <Stop offset={0.577136} stopColor="#5D34FF" stopOpacity={0.5} />
          <Stop offset={0.752365} stopColor="#5D34FF" stopOpacity={0.3} />
        </LinearGradient>
        <LinearGradient
          id="paint3_linear_1784_6970"
          x1={5.14616}
          y1={49.2678}
          x2={41.5975}
          y2={102.072}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset={0.260545} stopColor="#AF9BFD" />
          <Stop offset={0.56731} stopColor="#5F38FB" stopOpacity={0} />
          <Stop offset={0.847569} stopColor="#6C47FF" />
        </LinearGradient>
        <LinearGradient
          id="paint4_linear_1784_6970"
          x1={42.3316}
          y1={58.6025}
          x2={56.4493}
          y2={78.5295}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset={0.129418} stopColor="#FFA485" stopOpacity={0.9} />
          <Stop offset={0.408113} stopColor="#FF7445" stopOpacity={0.8} />
          <Stop offset={0.85239} stopColor="#FF7445" stopOpacity={0.5} />
        </LinearGradient>
        <LinearGradient
          id="paint5_linear_1784_6970"
          x1={44.201}
          y1={59.2915}
          x2={55.3766}
          y2={76.8666}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset={0.238491} stopColor="#FDCBBA" />
          <Stop offset={0.491823} stopColor="#F9774B" stopOpacity={0} />
          <Stop offset={0.855406} stopColor="#F86A3A" />
        </LinearGradient>
      </Defs>
    </Svg>
  );
};
