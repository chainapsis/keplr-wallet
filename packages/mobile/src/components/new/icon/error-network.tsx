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

export const ErrorNetworkIcon: FunctionComponent = (props) => {
  return (
    <Svg width={108} height={106} viewBox="0 0 108 106" fill="none" {...props}>
      <Path
        opacity={0.5}
        fillRule="evenodd"
        clipRule="evenodd"
        d="M32.523 43.99h8.167c.28-5.997 1.465-11.476 3.314-15.703.16-.365.326-.725.499-1.076-6.414 3.166-11.044 9.396-11.98 16.779zm21.61-24.55c-15.086 0-27.317 12.23-27.317 27.316 0 15.087 12.23 27.317 27.317 27.317s27.318-12.23 27.318-27.317S69.22 19.44 54.134 19.44zm0 5.532c-.567 0-1.326.251-2.258 1.152-.944.913-1.922 2.368-2.802 4.381-1.504 3.436-2.567 8.136-2.843 13.485h15.807c-.276-5.35-1.34-10.049-2.843-13.485-.88-2.013-1.858-3.468-2.802-4.381-.932-.9-1.69-1.152-2.259-1.152zM67.576 43.99c-.28-5.997-1.464-11.476-3.313-15.703-.16-.365-.326-.725-.499-1.076 6.414 3.166 11.044 9.396 11.98 16.779h-8.168zm-5.539 5.533H46.23c.276 5.349 1.34 10.048 2.843 13.484.88 2.013 1.858 3.469 2.802 4.382.932.9 1.69 1.152 2.258 1.152.568 0 1.327-.252 2.259-1.152.944-.913 1.921-2.369 2.802-4.381 1.504-3.437 2.567-8.136 2.843-13.485zm1.727 16.779c.173-.352.339-.711.499-1.077 1.849-4.226 3.033-9.706 3.313-15.702h8.168c-.936 7.382-5.566 13.613-11.98 16.779zm-19.261 0c-.173-.352-.339-.711-.499-1.077-1.849-4.226-3.033-9.706-3.313-15.702h-8.168c.935 7.382 5.566 13.613 11.98 16.779z"
        fill="#5F38FB"
      />
      <G filter="url(#filter0_bd_1772_2069)" shapeRendering="crispEdges">
        <Path
          d="M31.49 74.073c8.25 0 14.938-6.688 14.938-14.938S39.74 44.196 31.489 44.196c-8.25 0-14.938 6.688-14.938 14.939 0 8.25 6.688 14.938 14.938 14.938z"
          fill="url(#paint0_linear_1772_2069)"
        />
        <Path
          d="M46.038 59.135c0 8.034-6.514 14.548-14.549 14.548s-14.548-6.514-14.548-14.548c0-8.035 6.514-14.549 14.548-14.549 8.035 0 14.549 6.514 14.549 14.549z"
          stroke="url(#paint1_linear_1772_2069)"
          strokeWidth={0.780488}
        />
      </G>
      <Path
        d="M38.394 55.714l-3.031 3.031h-.796l.666.666 3.145 3.145a2.46 2.46 0 010 3.484 2.46 2.46 0 01-3.475 0l-3.146-3.146-.276-.276-.276.276-3.145 3.146a2.46 2.46 0 01-1.738.72 2.46 2.46 0 01-1.737-.72 2.46 2.46 0 010-3.484l3.145-3.145.276-.276-.276-.276-3.145-3.145a2.46 2.46 0 010-3.483 2.46 2.46 0 013.483 0l3.145 3.145.276.276.276-.276 3.145-3.145a2.46 2.46 0 013.484 0 2.46 2.46 0 010 3.483z"
        fill="url(#paint2_linear_1772_2069)"
        stroke="url(#paint3_linear_1772_2069)"
        strokeWidth={0.780488}
      />
      <G filter="url(#filter1_bd_1772_2069)">
        <Mask id="a" fill="#fff">
          <Path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M73.584 15.927a3.122 3.122 0 00-3.122 3.122v10.134a3.122 3.122 0 003.122 3.122h.077a3.122 3.122 0 003.122-3.122V19.049a3.122 3.122 0 00-3.122-3.122h-.077zm-.294 25.074a3.271 3.271 0 100-6.543 3.271 3.271 0 000 6.543z"
          />
        </Mask>
        <Path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M73.584 15.927a3.122 3.122 0 00-3.122 3.122v10.134a3.122 3.122 0 003.122 3.122h.077a3.122 3.122 0 003.122-3.122V19.049a3.122 3.122 0 00-3.122-3.122h-.077zm-.294 25.074a3.271 3.271 0 100-6.543 3.271 3.271 0 000 6.543z"
          fill="url(#paint4_linear_1772_2069)"
          //   shapeRendering="crispEdges"
        />
        <Path
          d="M71.242 19.049a2.342 2.342 0 012.342-2.341v-1.561a3.902 3.902 0 00-3.903 3.902h1.561zm0 10.134V19.049h-1.56v10.134h1.56zm2.342 2.341a2.342 2.342 0 01-2.342-2.341h-1.56a3.902 3.902 0 003.902 3.902v-1.56zm.077 0h-.077v1.561h.077v-1.56zm2.341-2.341a2.341 2.341 0 01-2.34 2.341v1.561a3.902 3.902 0 003.901-3.902h-1.56zm0-10.134v10.134h1.562V19.049h-1.561zm-2.34-2.341a2.341 2.341 0 012.34 2.341h1.562a3.902 3.902 0 00-3.903-3.902v1.56zm-.078 0h.077v-1.561h-.077v1.56zm2.197 21.021a2.49 2.49 0 01-2.491 2.491v1.561a4.052 4.052 0 004.052-4.052H75.78zm-2.491-2.49a2.49 2.49 0 012.49 2.49h1.562a4.052 4.052 0 00-4.052-4.052v1.561zm-2.491 2.49a2.49 2.49 0 012.49-2.49v-1.562a4.052 4.052 0 00-4.051 4.052h1.56zm2.49 2.491a2.49 2.49 0 01-2.49-2.49h-1.561a4.052 4.052 0 004.052 4.051v-1.56z"
          fill="url(#paint5_linear_1772_2069)"
          mask="url(#a)"
        />
      </G>
      <Defs>
        <LinearGradient
          id="paint0_linear_1772_2069"
          x1={59.6325}
          y1={33.1613}
          x2={-15.2538}
          y2={105.085}
          gradientUnits="userSpaceOnUse"
        >
          <Stop stopColor="#8566FF" stopOpacity={0.7} />
          <Stop offset={0.325347} stopColor="#8566FF" stopOpacity={0.7} />
          <Stop offset={0.576947} stopColor="#5D34FF" stopOpacity={0.5} />
          <Stop offset={0.752365} stopColor="#5D34FF" stopOpacity={0.3} />
        </LinearGradient>
        <LinearGradient
          id="paint1_linear_1772_2069"
          x1={28.1476}
          y1={30.3878}
          x2={45.3736}
          y2={87.748}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset={0.260545} stopColor="#AF9BFD" />
          <Stop offset={0.507722} stopColor="#5F38FB" stopOpacity={0} />
          <Stop offset={0.723349} stopColor="#6C47FF" />
        </LinearGradient>
        <LinearGradient
          id="paint2_linear_1772_2069"
          x1={21.4393}
          y1={50.5651}
          x2={29.1015}
          y2={77.5299}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset={0.129418} stopColor="#FFA485" stopOpacity={0.9} />
          <Stop offset={0.480643} stopColor="#FF7445" stopOpacity={0.8} />
          <Stop offset={0.824162} stopColor="#FF7445" stopOpacity={0.5} />
        </LinearGradient>
        <LinearGradient
          id="paint3_linear_1772_2069"
          x1={23.1004}
          y1={51.1177}
          x2={40.7051}
          y2={69.7873}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset={0.303674} stopColor="#FDCBBA" />
          <Stop offset={0.53419} stopColor="#F9774B" stopOpacity={0} />
          <Stop offset={0.855406} stopColor="#F86A3A" />
        </LinearGradient>
        <LinearGradient
          id="paint4_linear_1772_2069"
          x1={68.7862}
          y1={37.7294}
          x2={78.0668}
          y2={37.7986}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset={0.129418} stopColor="#FFA485" stopOpacity={0.9} />
          <Stop offset={0.408113} stopColor="#FF7445" stopOpacity={0.8} />
          <Stop offset={0.85239} stopColor="#FF7445" stopOpacity={0.5} />
        </LinearGradient>
        <LinearGradient
          id="paint5_linear_1772_2069"
          x1={66.3015}
          y1={34.4579}
          x2={84.0096}
          y2={34.9935}
          gradientUnits="userSpaceOnUse"
        >
          <Stop offset={0.238491} stopColor="#FDCBBA" />
          <Stop offset={0.448736} stopColor="#F9774B" stopOpacity={0} />
          <Stop offset={0.65597} stopColor="#F86A3A" />
        </LinearGradient>
      </Defs>
    </Svg>
  );
};
