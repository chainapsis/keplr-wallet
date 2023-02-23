import React, { FunctionComponent, useState } from "react";
import { TextInput } from "../../components/input";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { Button } from "../../components/button";

export const UnlockPage: FunctionComponent = observer(() => {
  const { keyRingStore } = useStore();

  const [password, setPassword] = useState("");

  return (
    <div>
      <TextInput
        value={password}
        onChange={(e) => {
          e.preventDefault();

          setPassword(e.target.value);
        }}
      />
      <Button
        text="Unlock"
        onClick={() => {
          keyRingStore.unlock(password);
        }}
      />
    </div>
  );
});
