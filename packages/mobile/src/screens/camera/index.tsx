import React, { FunctionComponent } from "react";
import { RNCamera } from "react-native-camera";
import { useStyle } from "../../styles";
import { PageWithView } from "../../components/staging/page";

export const CameraScreen: FunctionComponent = () => {
  const style = useStyle();

  return (
    <PageWithView disableSafeArea={true}>
      <RNCamera
        style={style.flatten(["flex-1"])}
        type={RNCamera.Constants.Type.back}
        barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}
        onBarCodeRead={({ data }) => {
          console.log(data);
        }}
      />
    </PageWithView>
  );
};
