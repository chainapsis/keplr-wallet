import React, { FunctionComponent, useState, useEffect } from "react";
import { AsyncKVStore } from "../common";

interface BioAuth {
  usingBioAuth: boolean;
  setUseBioAuth: () => Promise<void>;
  setNotUseBioAuth: () => Promise<void>;
}

const BioAuthContext = React.createContext<BioAuth | null>(null);

export const useBioAuth = () => {
  const bioAuth = React.useContext(BioAuthContext);
  return bioAuth;
};

export const BioAuthProvider: FunctionComponent = ({ children }) => {
  const [usingBioAuth, _setUsingBioAuth] = useState<boolean>(false);

  const initBioAuth = async () => {
    const isUsing = await new AsyncKVStore("setting").get("bio_auth");
    _setUsingBioAuth(isUsing as boolean);
  };

  useEffect(() => {
    initBioAuth();
  }, []);

  const setUseBioAuth = async () => {
    await new AsyncKVStore("setting").set("bio_auth", true);
    _setUsingBioAuth(true);
  };

  const setNotUseBioAuth = async () => {
    await new AsyncKVStore("setting").set("bio_auth", false);
    _setUsingBioAuth(false);
  };

  return (
    <BioAuthContext.Provider
      value={{ usingBioAuth, setUseBioAuth, setNotUseBioAuth }}
    >
      {children}
    </BioAuthContext.Provider>
  );
};
