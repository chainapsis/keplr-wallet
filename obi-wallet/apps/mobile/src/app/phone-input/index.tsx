import { Text, TextInput as OriginalTextInput } from "@obi-wallet/common";
import { reduce } from "fp-ts/lib/ReadonlyRecord";
import { ComponentType, useEffect, useState } from "react";
import {
  StyleProp,
  StyleSheet,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
  PixelRatio,
  Button,
  ScrollView,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";

import CountryPicker, { CountryModalProvider } from "../../app/country_src";
import { DARK_THEME } from "../../app/country_src";
import { CountryCode, Country } from "../../app/country_src/types";

const styles = StyleSheet.create({
  label: {
    color: "#787B9C",
    fontSize: 10,
    marginBottom: 12,
    textTransform: "uppercase",
  },

  wholeview: {

    flexDirection: "row",
    width: "100%",
    height: 56,
    borderWidth: 1,
    borderColor: "#2F2B4C",
    fontSize: 14,
    fontWeight: "500",
    color: "#F6F5FF",
    borderRadius: 12,
    //backgroundColor: "lightgray",
    alignItems: "center",
  },

  buttonview: {
    flex: 1,
    justifyContent: "center",
    //backgroundColor: "lightblue",
    paddingLeft: 20,
    paddingRight: 20
  },

  inputview: {
    flex: 1,
    flexDirection: "row",
    height: 56,
    borderColor: "#2F2B4C",
    borderLeftWidth: 1,
 
    fontSize: 14,
    fontWeight: "500",
    color: "#F6F5FF",
  },
  input: {
    flex: 1,
    paddingLeft: 20,
    color: "#F6F5FF",
    //backgroundColor: "lightblue",

  },

  // Country-Styles
  container: {
    //paddingVertical: 10,
    //justifyContent: "center",
    //alignItems: "center",
  },
  welcome: {
    fontSize: 17,
    textAlign: "center",
    margin: 5,
  },
  instructions: {
    fontSize: 10,
    textAlign: "center",
    color: "#888",
    marginBottom: 0,
  },
  data: {
    maxWidth: 300,
    backgroundColor: "#ddd",
    borderColor: "#888",
    borderWidth: 1 / PixelRatio.get(),
    color: "#777",
  },
});

export function PhoneInput({
  label,
  style,
  inputStyle,
  CustomTextInput = OriginalTextInput,
  ...props
}: TextInputProps & {
  CustomTextInput?: ComponentType<TextInputProps>;
  label?: string;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}) {
  // COUNTRY
  const [countryCode, setCountryCode] = useState<CountryCode | undefined>("US");
  const [country, setCountry] = useState<Country>({
    callingCode: ["1"],
    cca2: "US",
    currency: ["USD"],
    flag: "flag-us",
    name: "United States",
    region: "Americas",
    subregion: "North America",
  });
  const [withCountryNameButton, setWithCountryNameButton] =
    useState<boolean>(false);
  const [withCurrencyButton, setWithCurrencyButton] = useState<boolean>(false);
  const [withFlagButton, setWithFlagButton] = useState<boolean>(false);
  const [withCallingCodeButton, setWithCallingCodeButton] =
    useState<boolean>(false);
  const [withFlag, setWithFlag] = useState<boolean>(true);
  const [withEmoji, setWithEmoji] = useState<boolean>(true);
  const [withFilter, setWithFilter] = useState<boolean>(true);
  const [withAlphaFilter, setWithAlphaFilter] = useState<boolean>(false);
  const [withCallingCode, setWithCallingCode] = useState<boolean>(true);
  const [withCurrency, setWithCurrency] = useState<boolean>(false);
  const [withModal, setWithModal] = useState<boolean>(true);
  const [visible, setVisible] = useState<boolean>(false);
  const [dark, setDark] = useState<boolean>(true);
  const [fontScaling, setFontScaling] = useState<boolean>(true);
  const [disableNativeModal, setDisableNativeModal] = useState<boolean>(false);
  const onSelect = (country: Country) => {
    setCountryCode(country.cca2);
    setCountry(country);
  };
  const switchVisible = () => setVisible(!visible);


  return (
    <View style={style}>
      <CountryModalProvider>
        <ScrollView>
          {label ? <Text style={styles.label}>{label}</Text> : null}

          {/*country !== null && (
            <Text style={styles.data}>{JSON.stringify(country, null, 0)}</Text>
          )*/}

<CountryPicker
              theme={dark ? DARK_THEME : {}}
              {...{
                allowFontScaling: fontScaling,
                countryCode,
                withFilter,
                //excludeCountries: ['FR'],
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
                preferredCountries: ["US", "GB"],
                modalProps: {
                  visible,
                },
                onClose: () => setVisible(false),
                onOpen: () => setVisible(true),
              }}
            />


          <View style={styles.wholeview}>

            
            <TouchableOpacity style={styles.buttonview} onPress={switchVisible}>

              <Text style={{color: "#F6F5FF"}}>+{country.callingCode}</Text>

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
