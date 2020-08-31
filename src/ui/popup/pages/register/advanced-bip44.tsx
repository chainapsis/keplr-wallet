import React, { FunctionComponent, useState } from "react";
import { Button, FormGroup, Input, Label } from "reactstrap";
import { useConfirm } from "../../../components/confirm";
import { useRegisterState } from "../../../contexts/register";

export const AdvancedBIP44Option: FunctionComponent = () => {
  const registerState = useRegisterState();
  const confirm = useConfirm();

  const [isOpen, setIsOpen] = useState(
    registerState.bip44HDPath.account !== 0 ||
      registerState.bip44HDPath.change !== 0 ||
      registerState.bip44HDPath.addressIndex !== 0
  );
  const toggleOpen = async () => {
    if (isOpen) {
      if (
        await confirm.confirm({
          paragraph:
            "Closing this toggle will reset the HD Path. Are you sure you want to proceed?"
        })
      ) {
        setIsOpen(false);
        registerState.setBIP44HDPath({
          account: 0,
          change: 0,
          addressIndex: 0
        });
      }
    } else {
      setIsOpen(true);
    }
  };

  return (
    <React.Fragment>
      <Button
        type="button"
        color="link"
        onClick={e => {
          e.preventDefault();
          toggleOpen();
        }}
      >
        Advanced
      </Button>
      {isOpen ? (
        <FormGroup>
          <Label target="bip44-path" className="form-control-label">
            BIP44 HD Path
          </Label>
          <div
            id="bip44-path"
            style={{
              display: "flex",
              alignItems: "baseline"
            }}
          >
            <div>{"m/44'/118'/"}</div>
            <Input
              type="number"
              className="form-control-alternative"
              style={{ width: "100px", textAlign: "right" }}
              value={registerState.bip44HDPath.account.toString()}
              onChange={e => {
                e.preventDefault();

                let value = e.target.value;
                if (value) {
                  if (value !== "0") {
                    // Remove leading zeros
                    for (let i = 0; i < value.length; i++) {
                      if (value[i] === "0") {
                        value = value.replace("0", "");
                      } else {
                        break;
                      }
                    }
                  }
                  const parsed = parseFloat(value);
                  // Should be integer and positive.
                  if (Number.isInteger(parsed) && parsed >= 0) {
                    if (registerState.bip44HDPath.account !== parsed) {
                      registerState.setBIP44HDPath({
                        account: parsed,
                        change: 0,
                        addressIndex: 0
                      });
                    }
                  }
                } else {
                  if (registerState.bip44HDPath.account !== 0) {
                    registerState.setBIP44HDPath({
                      account: 0,
                      change: 0,
                      addressIndex: 0
                    });
                  }
                }
              }}
            />
            <div>{`'/${registerState.bip44HDPath.change}/${registerState.bip44HDPath.addressIndex}`}</div>
          </div>
        </FormGroup>
      ) : null}
    </React.Fragment>
  );
};
