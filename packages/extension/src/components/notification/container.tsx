import React, { FunctionComponent } from "react";
import { NotificationProperty, useNotification } from "./index";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { NotificationElement } from "./element";

export interface Props {
  id: string;
  properties: NotificationProperty[];
  initial: any;
  variants: Variants;
}

export const NotificationContainer: FunctionComponent<Props> = ({
  id,
  properties,
  initial,
  variants,
}) => {
  const notification = useNotification();

  return (
    <motion.ul id={id} style={{ listStyle: "none" }}>
      <AnimatePresence>
        {properties.map((property) => {
          return (
            <motion.li
              initial={initial}
              variants={variants}
              animate="visible"
              transition={{
                duration: property.transition.duration,
              }}
              exit="hidden"
              key={property.id}
            >
              <NotificationElement
                {...property}
                onDelete={() => {
                  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                  notification.remove(property.id!);
                }}
              />
            </motion.li>
          );
        })}
      </AnimatePresence>
    </motion.ul>
  );
};
