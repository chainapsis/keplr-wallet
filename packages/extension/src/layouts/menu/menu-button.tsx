import React, { FunctionComponent } from "react";

import { motion, MotionProps } from "framer-motion";

const Path: FunctionComponent<MotionProps | { d: string }> = (props) => (
  <motion.path
    fill="transparent"
    strokeWidth="2"
    stroke="hsl(0, 0%, 18%)"
    strokeLinecap="round"
    {...props}
  />
);

// eslint-disable-next-line react/display-name
export const MenuButton = React.forwardRef<SVGSVGElement>((_, ref) => {
  return (
    <motion.svg viewBox="0 0 20 20" ref={ref}>
      <Path
        variants={{
          closed: { d: "M 3 4 L 17 4" },
          open: { d: "M 3 4 L 17 16" },
        }}
        initial={{
          d: "M 3 4 L 17 4",
        }}
      />
      <Path
        d="M 3 10 L 17 10"
        variants={{
          closed: { opacity: 1 },
          open: { opacity: 0 },
        }}
        initial={{
          opacity: 1,
        }}
        transition={{ duration: 0.1 }}
      />
      <Path
        variants={{
          closed: { d: "M 3 16 L 17 16" },
          open: { d: "M 3 16 L 17 4" },
        }}
        initial={{
          d: "M 3 16 L 17 16",
        }}
      />
    </motion.svg>
  );
});
