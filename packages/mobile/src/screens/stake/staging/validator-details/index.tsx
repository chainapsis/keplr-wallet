import React, { FunctionComponent } from "react";
import { PageWithScrollView } from "../../../../components/staging/page";
import { RouteProp, useRoute } from "@react-navigation/native";
import { ValidatorDetailsCard } from "./validator-details-card";

export const ValidatorDetailsScreen: FunctionComponent = () => {
  const route = useRoute<
    RouteProp<
      Record<
        string,
        {
          validatorAddress: string;
        }
      >,
      string
    >
  >();

  const validatorAddress = route.params.validatorAddress;

  return (
    <PageWithScrollView>
      <ValidatorDetailsCard validatorAddress={validatorAddress} />
    </PageWithScrollView>
  );
};
