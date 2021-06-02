import React, { FunctionComponent } from "react";

import { gestureHandlerRootHOC } from "react-native-gesture-handler";
import { FlexButton, FlexWhiteButton } from "../components/buttons";

// RectButton in Modal only working in HOC on android
export const FlexButtonWithHoc: FunctionComponent<
  React.ComponentProps<typeof FlexButton>
> = (props) => {
  const ButtonHOC = gestureHandlerRootHOC(() => {
    return <FlexButton {...props} />;
  });

  return <ButtonHOC />;
};

export const FlexWhiteButtonWithHoc: FunctionComponent<
  React.ComponentProps<typeof FlexWhiteButton>
> = (props) => {
  const ButtonHOC = gestureHandlerRootHOC(() => {
    return <FlexWhiteButton {...props} />;
  });

  return <ButtonHOC />;
};
