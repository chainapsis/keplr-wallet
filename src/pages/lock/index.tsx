import React, { FunctionComponent, useState } from "react";

import { observer } from "mobx-react";
import { useStore } from "../../stores";

export const LockPage: FunctionComponent = observer(() => {
  const { keyRing } = useStore();

  const [password, setPassword] = useState("");

  return (
    <form
      className="pure-form"
      onSubmit={async e => {
        e.preventDefault();
        await keyRing.unlock(password);
        await keyRing.save();
      }}
    >
      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={e => {
            setPassword(e.target.value);
          }}
        />
        <input type="submit" value="Submit" />
      </label>
    </form>
  );
});
