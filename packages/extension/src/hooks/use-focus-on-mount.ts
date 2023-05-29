import { useEffect, useRef } from "react";

export const useFocusOnMount = <Ref extends HTMLElement>() => {
  const ref = useRef<Ref>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, []);
  return ref;
};
