import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../stores";
import { View } from "react-native";
import { FlexButtonWithHoc, FlexWhiteButtonWithHoc } from "./common";

const dummyButtons = ["test1", "test2", "test3"];

export const DialogView: FunctionComponent = observer(() => {
  const { interactionModalStore } = useStore();

  return (
    <React.Fragment>
      {dummyButtons.map((button, index) => {
        return (
          <View key={index} style={{ height: 50, paddingHorizontal: 12 }}>
            <FlexWhiteButtonWithHoc
              title={button}
              onPress={() => {
                console.log(index);
                interactionModalStore.popUrl();
              }}
            />
          </View>
        );
      })}
      <View style={{ height: 10 }} />
      <View style={{ height: 50, paddingHorizontal: 12 }}>
        <FlexButtonWithHoc
          title="Cancel"
          onPress={() => {
            interactionModalStore.popUrl();
          }}
        />
      </View>
      <View style={{ height: 30 }} />
    </React.Fragment>
  );
});
