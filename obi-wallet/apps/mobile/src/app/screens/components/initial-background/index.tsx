import { ImageBackground } from "react-native";

export interface InitialBackgroundProps {
  children?: React.ReactNode;
}

export function InitialBackground(props: InitialBackgroundProps) {
  return (
    <ImageBackground
      source={require("./assets/background.png")}
      resizeMode="cover"
      imageStyle={{ height: 609 }}
      style={{
        backgroundColor: "#090817",
        flex: 1,
      }}
      {...props}
    />
  );
}
