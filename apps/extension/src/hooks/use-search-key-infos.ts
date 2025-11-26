import { useEffect, useState } from "react";
import { useStore } from "../stores";
import { KeyInfo } from "@keplr-wallet/background";

export const useSearchKeyInfos = () => {
  const { keyRingStore } = useStore();
  const [searchText, setSearchText] = useState<string>("");
  const [debounceSearchText, setDebounceSearchText] = useState<string>("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounceSearchText(searchText);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [searchText]);

  const [searchedKeyInfos, setSearchedKeyInfos] = useState<
    KeyInfo[] | undefined
  >(undefined);
  useEffect(() => {
    if (debounceSearchText.trim().length === 0) {
      setSearchedKeyInfos(undefined);
      return;
    }

    let exposed = false;

    keyRingStore
      .searchKeyRings(debounceSearchText)
      .then((keyInfos) => {
        if (!exposed) {
          setSearchedKeyInfos(keyInfos);
        }
      })
      .catch(console.log);

    return () => {
      exposed = true;
    };
  }, [debounceSearchText, keyRingStore]);

  return {
    searchText,
    setSearchText,
    searchedKeyInfos,
    setSearchedKeyInfos,
  };
};
