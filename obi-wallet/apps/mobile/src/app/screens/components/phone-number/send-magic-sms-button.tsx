import { faInfoCircle } from "@fortawesome/free-solid-svg-icons/faInfoCircle";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Text } from "@obi-wallet/common";
import { View } from "react-native";

import { Button } from "../../../button";
import SMS from "./assets/sms.svg";

export interface SendMagicSmsButtonProps {
  description?: string;
  disabled?: boolean;
  onPress: () => void;
}

export function SendMagicSmsButton({
  description,

  onPress,
  disabled,
}: SendMagicSmsButtonProps) {
  return (
    <View style={{ marginVertical: 20 }}>
      {description ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
          <FontAwesomeIcon
            icon={faInfoCircle}
            style={{
              color: "#7B87A8",
              marginHorizontal: 5,
              position: "absolute",
              margin: 5,
            }}
          />
          <Text
            style={{
              color: "#F6F5FF",
              marginLeft: 30,
              opacity: 0.7,
              fontSize: 12,
            }}
          >
            {description}
          </Text>
        </View>
      ) : null}
      <View style={{ marginVertical: 10 }}></View>
      <Button
        label="Send Magic SMS"
        LeftIcon={SMS}
        flavor="blue"
        disabled={disabled}
        style={{}}
        onPress={onPress}
      />
    </View>
  );
}
