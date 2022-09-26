import { useEffect } from "react";

import { HomeScreen } from "../src/app/screens/home";
import { useStore } from "../src/app/stores";

export default () => {
  const { demoStore } = useStore();
  useEffect(() => {
    demoStore.demoMode = true;
  }, []);
  return <HomeScreen />;
};
