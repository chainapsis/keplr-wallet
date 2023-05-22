import React, { FunctionComponent } from "react";
import { useSmartNavigation } from "../../navigation";
import { WebpageImageButton } from "./common";
import { useStyle } from "../../styles";
import { Image, View } from "react-native";

export type Item = {
  key: string;
  component: FunctionComponent;
};

const OsmosisImage: FunctionComponent = () => {
  const smartNavigation = useSmartNavigation();

  return (
    <WebpageImageButton
      name="Osmosis"
      source={require("../../assets/image/webpage/osmosis.png")}
      onPress={() => {
        smartNavigation.pushSmart("Web.Osmosis", {});
      }}
    />
  );
};

export const OsmosisItem: Item = {
  key: "osmosis",
  component: OsmosisImage,
};

const StargazeImage: FunctionComponent = () => {
  const smartNavigation = useSmartNavigation();

  return (
    <WebpageImageButton
      name="Stargaze"
      source={require("../../assets/image/webpage/stargaze.png")}
      onPress={() => {
        smartNavigation.pushSmart("Web.Stargaze", {});
      }}
    />
  );
};

export const StargazeItem: Item = {
  key: "stargaze",
  component: StargazeImage,
};

const WYNDDaoImage: FunctionComponent = () => {
  const smartNavigation = useSmartNavigation();

  return (
    <WebpageImageButton
      name="WYND Dao"
      source={require("../../assets/image/webpage/wynddao.png")}
      onPress={() => {
        smartNavigation.pushSmart("Web.WYNDDao", {});
      }}
    />
  );
};

export const WYNDDaoItem: Item = {
  key: "wynddao",
  component: WYNDDaoImage,
};

const DaoDaoImage: FunctionComponent = () => {
  const smartNavigation = useSmartNavigation();
  const style = useStyle();

  return (
    <WebpageImageButton
      name="DAO DAO"
      source={require("../../assets/image/webpage/daodao.png")}
      overlayStyle={style.flatten(["opacity-60"])}
      onPress={() => {
        smartNavigation.pushSmart("Web.DaoDao", {});
      }}
    />
  );
};

export const DaoDaoItem: Item = {
  key: "daodao",
  component: DaoDaoImage,
};

const InjectiveImage: FunctionComponent = () => {
  const smartNavigation = useSmartNavigation();

  return (
    <WebpageImageButton
      name="Injective"
      source={require("../../assets/image/webpage/injective.png")}
      onPress={() => {
        smartNavigation.pushSmart("Web.Injective", {});
      }}
    />
  );
};

export const InjectiveItem: Item = {
  key: "injective",
  component: InjectiveImage,
};

export const OsmosisFrontierImage: FunctionComponent = () => {
  const smartNavigation = useSmartNavigation();
  const style = useStyle();

  return (
    <WebpageImageButton
      name="Osmosis"
      source={require("../../assets/image/webpage/osmosis-frontier.png")}
      nameContainerStyle={style.flatten(["flex-row"])}
      nameAppend={
        <View style={style.flatten(["justify-end"])}>
          <Image
            source={require("../../assets/image/webpage/osmosis-frontier-text.png")}
            style={{
              width: 52.8,
              height: 18,
              marginLeft: 8,
              marginBottom: 7,
            }}
            fadeDuration={0}
          />
        </View>
      }
      onPress={() => {
        smartNavigation.pushSmart("Web.OsmosisFrontier", {});
      }}
    />
  );
};

export const OsmosisFrontierItem: Item = {
  key: "osmosis-frontier",
  component: OsmosisFrontierImage,
};

const MarsImage: FunctionComponent = () => {
  const smartNavigation = useSmartNavigation();

  return (
    <WebpageImageButton
      name="Mars Hub"
      source={require("../../assets/image/webpage/mars.png")}
      onPress={() => {
        smartNavigation.pushSmart("Web.Mars", {});
      }}
    />
  );
};

export const MarsItem: Item = {
  key: "mars",
  component: MarsImage,
};

const UmeeImage: FunctionComponent = () => {
  const smartNavigation = useSmartNavigation();

  return (
    <WebpageImageButton
      name="Umee"
      source={require("../../assets/image/webpage/umee.png")}
      onPress={() => {
        smartNavigation.pushSmart("Web.Umee", {});
      }}
    />
  );
};

export const UmeeItem: Item = {
  key: "umee",
  component: UmeeImage,
};

const StrideImage: FunctionComponent = () => {
  const smartNavigation = useSmartNavigation();
  const style = useStyle();

  return (
    <WebpageImageButton
      name="Stride"
      source={require("../../assets/image/webpage/stride.png")}
      overlayStyle={style.flatten(["opacity-60"])}
      onPress={() => {
        smartNavigation.pushSmart("Web.Stride", {});
      }}
    />
  );
};

export const StrideItem: Item = {
  key: "stride",
  component: StrideImage,
};

const RegenImage: FunctionComponent = () => {
  const smartNavigation = useSmartNavigation();

  return (
    <WebpageImageButton
      name="Regen"
      source={require("../../assets/image/webpage/regen.png")}
      onPress={() => {
        smartNavigation.pushSmart("Web.Regen", {});
      }}
    />
  );
};

export const RegenItem: Item = {
  key: "regen",
  component: RegenImage,
};

const PStakeImage: FunctionComponent = () => {
  const smartNavigation = useSmartNavigation();

  return (
    <WebpageImageButton
      name="pSTAKE"
      source={require("../../assets/image/webpage/pstake.png")}
      onPress={() => {
        smartNavigation.pushSmart("Web.PStake", {});
      }}
    />
  );
};

export const PStakeItem: Item = {
  key: "pstake",
  component: PStakeImage,
};

const StreamSwapImage: FunctionComponent = () => {
  const smartNavigation = useSmartNavigation();

  return (
    <WebpageImageButton
      name="StreamSwap"
      source={require("../../assets/image/webpage/streamswap.png")}
      onPress={() => {
        smartNavigation.pushSmart("Web.StreamSwap", {});
      }}
    />
  );
};

export const StreamSwapItem: Item = {
  key: "streamswap",
  component: StreamSwapImage,
};

const IBCXImage: FunctionComponent = () => {
  const smartNavigation = useSmartNavigation();

  return (
    <WebpageImageButton
      name="IBCX"
      source={require("../../assets/image/webpage/ibcx.png")}
      onPress={() => {
        smartNavigation.pushSmart("Web.IBCX", {});
      }}
    />
  );
};

export const IBCXItem: Item = {
  key: "ibcx",
  component: IBCXImage,
};
