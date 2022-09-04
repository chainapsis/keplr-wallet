import { Text, TextInput as OriginalTextInput } from "@obi-wallet/common";
import { ComponentType, useEffect, useState } from "react";
import {
  StyleProp,
  StyleSheet,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
  ScrollView,
} from "react-native";
import CountryPicker, {
  CountryModalProvider,
} from "react-native-country-picker-modal/src";
import { DARK_THEME } from "react-native-country-picker-modal/src";
import {
  CountryCode,
  Country,
} from "react-native-country-picker-modal/src/types";
import { TouchableOpacity } from "react-native-gesture-handler";

const styles = StyleSheet.create({
  label: {
    color: "#787B9C",
    fontSize: 10,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  wholeview: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 56,
    borderWidth: 1,
    borderColor: "#2F2B4C",
    fontSize: 14,
    fontWeight: 500,
    color: "#F6F5FF",
    borderRadius: 12,
  },
  buttonview: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 14,
    fontWeight: 500,
    paddingLeft: 20,
    paddingRight: 20,
  },
  inputview: {
    flex: 1,
    flexDirection: "row",
    height: 56,
    borderColor: "#2F2B4C",
    borderLeftWidth: 1,
    fontSize: 14,
    fontWeight: 500,
    color: "#F6F5FF",
  },
  input: {
    flex: 1,
    paddingLeft: 20,
    color: "#F6F5FF",
  },
  data: {
    backgroundColor: "white",
    padding: 10,
  },
});

export function PhoneInput({
  label,
  style,
  inputStyle,
  CustomTextInput = OriginalTextInput,
  handlePhoneNumberCountryCode,
  ...props
}: TextInputProps & {
  CustomTextInput?: ComponentType<TextInputProps>;
  label?: string;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  handlePhoneNumberCountryCode?: (param: string) => void;
}) {
  const [countryCode, setCountryCode] = useState<CountryCode | undefined>("US");
  const [country, setCountry] = useState<Country>({
    // Default Selection
    callingCode: ["1"],
    cca2: "US",
    currency: ["USD"],
    flag: "flag-us",
    name: "United States",
    region: "Americas",
    subregion: "North America",
  });
  const [withCountryNameButton] = useState<boolean>(false);
  const [withCurrencyButton] = useState<boolean>(false);
  const [withFlagButton] = useState<boolean>(true);
  const [withCallingCodeButton] = useState<boolean>(true);
  const [withFlag] = useState<boolean>(true);
  const [withEmoji] = useState<boolean>(false);
  const [withFilter] = useState<boolean>(true);
  const [withAlphaFilter] = useState<boolean>(false);
  const [withCallingCode] = useState<boolean>(true);
  const [withCurrency] = useState<boolean>(false);
  const [withModal] = useState<boolean>(true);
  const [visible, setVisible] = useState<boolean>(false);
  const [dark] = useState<boolean>(true);
  const [fontScaling] = useState<boolean>(true);
  const [disableNativeModal] = useState<boolean>(false);
  const onSelect = (country: Country) => {
    setCountryCode(country.cca2);
    setCountry(country);
  };
  const switchVisible = () => setVisible(!visible);

  useEffect(() => {
    handlePhoneNumberCountryCode("+" + country.callingCode); // Pass country.callingcode back to parent component "onboarding2"
  }, [country.callingCode, handlePhoneNumberCountryCode]);

  return (
    <View style={style}>
      <CountryModalProvider>
        <ScrollView>
          {label ? <Text style={styles.label}>{label}</Text> : null}

          {/*country !== null && (
            <Text style={styles.data}>{JSON.stringify(country, null, 0)}</Text>
          )*/}

          <View style={styles.wholeview}>
            <TouchableOpacity style={styles.buttonview} onPress={switchVisible}>
              <View
                style={{ backgroundColor: "none", padding: 0, marginBottom: 5 }}
              >
                <CountryPicker
                  theme={dark ? DARK_THEME : {}}
                  {...{
                    allowFontScaling: fontScaling,
                    countryCode,
                    withFilter,
                    excludeCountries: ["AQ", "BV", "TF", "HM", "UM"], // No Calling-Code available
                    withFlag,
                    withCurrencyButton,
                    withCallingCodeButton,
                    withCountryNameButton,
                    withAlphaFilter,
                    withCallingCode,
                    withCurrency,
                    withEmoji,
                    withModal,
                    withFlagButton,
                    onSelect,
                    disableNativeModal,
                    preferredCountries: ["US"],
                    modalProps: {
                      visible,
                    },
                    onClose: () => setVisible(false),
                    onOpen: () => setVisible(true),
                  }}
                />
              </View>
            </TouchableOpacity>

            <View style={styles.inputview}>
              <CustomTextInput
                style={[styles.input, inputStyle]}
                placeholderTextColor="#4B4E6E"
                {...props}
              />
            </View>
          </View>
        </ScrollView>
      </CountryModalProvider>
    </View>
  );
}
