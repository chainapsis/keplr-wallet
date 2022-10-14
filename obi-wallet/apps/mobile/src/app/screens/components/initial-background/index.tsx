import { ImageBackground, View } from "react-native";

export interface InitialBackgroundProps {
  children?: React.ReactNode;
  disabled?: boolean;
}

export function InitialBackground(props: InitialBackgroundProps) {
  const styles = {
    backgroundColor: "#090817",
    flex: 1,
  };

  return props.disabled ? (
    <View style={styles} {...props} />
  ) : (
    <ImageBackground
      source={require("./assets/background.png")}
      resizeMode="cover"
      imageStyle={{ height: 609 }}
      style={styles}
      {...props}
    />
  );
}
