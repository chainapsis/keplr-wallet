import React, { useState } from "react";
import { View, Text, Switch } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "../../button";
import { DropDownPicker } from "../../drop-down-picker";
import { TextInput } from "../../text-input";
import SpendingIcon from "./assets/spendingIcon.svg";
const repeatsEvery = [
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
];
export function Spending() {
  const safeArea = useSafeAreaInsets();
  const [repeatOpened, setRepeatOpened] = useState(false);
  const [repeats, setRepeats] = useState(repeatsEvery[0].value);

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 20,
        marginBottom: safeArea.bottom,
        justifyContent: "space-between",
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row" }}>
          <SpendingIcon style={{ width: 40, height: 40 }} />
          <View style={{ paddingLeft: 10 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#f6f5ff",
                marginBottom: 4,
              }}
            >
              Spending
            </Text>
            <Text style={{ color: "#f6f5ff", opacity: 0.6 }}>
              dungeon_master
            </Text>
          </View>
        </View>
        <View style={{ height: "100%", alignSelf: "flex-end" }}>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            // thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            // onValueChange={toggleSwitch}
            value={true}
          />
        </View>
      </View>
      <View>
        <Text
          style={{
            fontWeight: "500",
            color: "white",
            fontSize: 14,
            marginBottom: 20,
          }}
        >
          Spendig Limit
        </Text>
        <View style={{ flexDirection: "row" }}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <TextInput label="Amount" placeholder="1" />
          </View>
          <View style={{ flex: 1, paddingLeft: 10 }}>
            <Text style={{ fontSize: 10, color: "#787B9C", marginBottom: 12 }}>
              REPEATS EVERY
            </Text>
            <DropDownPicker
              open={repeatOpened}
              value={repeats}
              items={repeatsEvery}
              setOpen={setRepeatOpened}
              setValue={setRepeats}
              style={{ flex: 1, zIndex: 3 }}
            />
          </View>
        </View>
      </View>
      <View>
        <Button flavor="blue" label="Confirm" />
      </View>
    </View>
  );
}
