import React, { FunctionComponent } from "react";
import { View } from "react-native";
import { NotificationProperty, useNotification } from "./index";
import { NotificationElement } from "./element";

export interface Props {
  properties: NotificationProperty[];
  initial: {};
}

export const NotificationContainer: FunctionComponent<Props> = ({
  properties,
  initial,
}) => {
  const notification = useNotification();

  return (
    <View style={initial}>
      {properties.map((property) => {
        return (
          <NotificationElement
            {...property}
            onDelete={() => {
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              notification.remove(property.id!);
            }}
          />
        );
      })}
    </View>
  );
};
