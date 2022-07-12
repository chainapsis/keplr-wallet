import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";

import { createShadow } from "../styles";
import { Text } from "../typography";

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tile: {
    width: "33.33%",
    padding: 12,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 7,
    ...createShadow(10),
  },
  icon: {
    width: "100%",
    height: "100%",
    borderRadius: 7,
  },
  label: {
    fontSize: 12,
    marginTop: 4,
  },
});

export function Tiles({ children }: { children: React.ReactNode }) {
  return <View style={styles.container}>{children}</View>;
}

export interface TileProps {
  img?: string;
  label: string;
  disabled?: boolean;
  onRemove?: () => void;
  onPress: () => void;
}

export function Tile({ img, label, disabled, onRemove, onPress }: TileProps) {
  const children = (
    <>
      <View style={styles.iconContainer}>
        <Image
          style={styles.icon}
          source={{
            uri: img || "https://place-hold.it/180x180",
          }}
        />
        {onRemove ? <RemoveButton onPress={onRemove} /> : null}
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </>
  );

  const containerStyle = [styles.tile, { opacity: disabled ? 0.5 : 1 }];

  return onRemove ? (
    <View style={containerStyle}>{children}</View>
  ) : (
    <TouchableOpacity style={containerStyle} onPress={onPress}>
      {children}
    </TouchableOpacity>
  );
}

const removeButtonStyles = StyleSheet.create({
  button: {
    position: "absolute",
    right: 5,
    top: 5,
    backgroundColor: "#ffffff",
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: "#000000",

    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#000000",
    fontSize: 10,
    textAlign: "center",
    textAlignVertical: "bottom",
  },
});

function RemoveButton({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity style={removeButtonStyles.button} onPress={onPress}>
      {/* TODO: cross is not black (probably because font does not support that character.
          Maybe add icon or do something with svg */}
      <Text style={removeButtonStyles.text}>✖</Text>
    </TouchableOpacity>
  );
}
