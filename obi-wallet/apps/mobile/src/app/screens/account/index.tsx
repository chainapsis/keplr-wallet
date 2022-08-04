import React from "react";
import { Text } from "@obi-wallet/common";
import {
  Button,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  Image,
  View,
  ImageBackground,
  FlatList,
} from "react-native";

import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { Background } from "../components/background";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons/faCheckCircle";
import { faGear } from "@fortawesome/free-solid-svg-icons/faGear";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
//TODO: add background svgs

export default function Account() {
  const safeArea = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, paddingHorizontal: 20 }}>
      <Background />
      <View style={{ flexDirection: "row", top: safeArea.top }}>
        <TouchableHighlight>
          <FontAwesomeIcon
            icon={faChevronLeft}
            style={{ color: "#7B87A8", alignSelf: "flex-start" }}
          />
        </TouchableHighlight>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: "#F6F5FF",
            textAlign: "center",
            flex: 1,
            marginLeft: -16,
          }}
        >
          Account
        </Text>
      </View>
      <View
        style={{
          height: 165,
          marginTop: safeArea.top + 34,
          backgroundColor: "#1C0C3F",
          borderRadius: 16,
        }}
      >
        <ImageBackground
          source={require("./assets/accountbg.png")}
          style={{ flex: 1, padding: 20, position: "relative" }}
          resizeMode="cover"
          borderRadius={16}
        >
          <TouchableHighlight
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              backgroundColor: "rgba(255,255,255,.12)",
              padding: 5,
              borderRadius: 20,
            }}
          >
            <FontAwesomeIcon icon={faGear} style={{ color: "#F6F5FF" }} />
          </TouchableHighlight>
          <Text
            style={{
              color: "#787B9C",
              marginTop: 8,
              fontSize: 11,
              fontWeight: "500",
            }}
          >
            PARENT ACCOUNT
          </Text>
          <Text
            style={{
              color: "#F6F5FF",
              marginTop: 10,
              fontSize: 20,
              fontWeight: "500",
            }}
          >
            $38,166.92
          </Text>
          <TouchableHighlight
            style={{
              height: 29,
              backgroundColor: "rgba(255,255,255,.12)",
              alignSelf: "flex-start",
              justifyContent: "center",
              paddingHorizontal: 20,
              borderRadius: 40,
              marginTop: 40,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: "500", color: "white" }}>
              +Add sub-account
            </Text>
          </TouchableHighlight>
        </ImageBackground>
      </View>
      <View
        style={{
          backgroundColor: "#16152D",
          marginTop: 34,
          borderRadius: 12,
          padding: 20,
        }}
      >
        <View style={{ flexDirection: "row" }}>
          <Image
            source={require("./assets/avatars/avatars-3.png")}
            style={{ height: 42, width: 42, borderRadius: 42 }}
          />
          <View style={{ paddingLeft: 10, flex: 1 }}>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text
                style={{ color: "#F6F5FF", fontSize: 14, fontWeight: "500" }}
              >
                $4,582
              </Text>
              <FontAwesomeIcon
                icon={faCheckCircle}
                style={{ width: 16, height: 16, color: "#7AD6AE" }}
              />
            </View>
            <Text
              style={{
                color: "rgba(246, 245, 255, 0.6);",
                fontSize: 12,
                fontWeight: "400",
              }}
            >
              dungeon_master
            </Text>
          </View>
        </View>
        <View>
          <View
            style={{
              height: 6,
              backgroundColor: "#1E1D3A",
              borderRadius: 4,
              marginTop: 20,
              marginBottom: 8,
            }}
          >
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              colors={["#FCCFF7", "#E659D6", "#8877EA", "#86E2EE", "#1E1D3A"]}
              style={{ flex: 1, width: "60%", borderRadius: 4 }}
            />
          </View>
          <View
            style={{ justifyContent: "space-between", flexDirection: "row" }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "400",
                color: "rgba(246, 245, 255, 0.6);",
              }}
            >
              Daily Balance
            </Text>
            <View style={{ flexDirection: "row" }}>
              <Text
                style={{ fontSize: 11, fontWeight: "400", color: "#f6f5ff" }}
              >
                $80
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "400",
                  color: "#f6f5ff",
                  opacity: 0.6,
                }}
              >
                /100
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View
        style={{
          flex: 3,
          justifyContent: "flex-end",
          paddingBottom: 20,
          marginBottom: safeArea.bottom / 2,
          marginTop: 10,
        }}
      >
        <FlatList
          data={[
            { key: "1", amount: 231, name: "My_personal_wallet" },
            { key: "2", amount: 8293, name: "Hot_wallet" },
            { key: "3", amount: 8293, name: "Captain_Private" },
            { key: "4", amount: 8293, name: "other_one" },
          ]}
          renderItem={({ item }) => {
            const images = [
              require("./assets/avatars/avatars-1.png"),
              require("./assets/avatars/avatars-2.png"),
              require("./assets/avatars/avatars-3.png"),
              require("./assets/avatars/avatars-4.png"),
            ];

            return (
              <View
                style={{
                  backgroundColor: "#0F0E20",
                  borderRadius: 12,
                  marginVertical: 10,
                  flexDirection: "row",
                  padding: 20,
                  flex: 1,
                }}
              >
                <Image
                  source={images[Number(item.key) - 1]}
                  style={{ height: 42, width: 42, borderRadius: 42 }}
                />
                <View style={{ paddingLeft: 10, flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "400",
                      color: "#f6f5ff",
                    }}
                  >
                    {item.amount}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "400",
                      color: "rgba(246, 245, 255, 0.6);",
                    }}
                  >
                    {item.name}
                  </Text>
                </View>
                <View style={{ justifyContent: "center" }}>
                  <View
                    style={{
                      width: 16,
                      height: 16,
                      borderColor: "rgba(255,255,255,.4)",
                      borderWidth: 1,
                      borderRadius: 16,
                    }}
                  ></View>
                </View>
              </View>
            );
          }}
        />
      </View>
    </View>
  );
}
