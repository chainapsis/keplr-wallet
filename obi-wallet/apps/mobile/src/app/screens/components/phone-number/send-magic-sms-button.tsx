import { faInfoCircle } from "@fortawesome/free-solid-svg-icons/faInfoCircle";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Text } from "@obi-wallet/common";
import { useIntl } from "react-intl";
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
  const intl = useIntl();

  return (
    <View>
      {description ? (
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            marginTop: 15,
          }}
        >
          <FontAwesomeIcon
            icon={faInfoCircle}
            style={{
              color: "#7B87A8",
              margin: 5,
            }}
          />

          <Text
            style={{
              color: "#F6F5FF",
              marginLeft: 10,
              opacity: 0.7,
              fontSize: 12,
            }}
          >
            {description}
          </Text>
        </View>
      ) : null}
      <Button
        label={intl.formatMessage({
          id: "onboarding2.sendmagicsms",
          defaultMessage: "Get Magic SMS",
        })}
        LeftIcon={SMS}
        flavor="blue"
        disabled={disabled}
        style={{
          marginVertical: 20,
        }}
        onPress={(e) => {
          if (!disabled) {
            onPress();
          }
        }}
      />
    </View>
  );
}
