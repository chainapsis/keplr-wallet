import React, { FunctionComponent, useState } from "react";
import { IPermissionConfig } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";
import stylePermissionInput from "./permission-input.module.scss";
import classnames from "classnames";

import {
  ButtonDropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  FormGroup,
  Label,
} from "reactstrap";
import { FormattedMessage } from "react-intl";

export interface PermissionInputProps {
  permissionConfig: IPermissionConfig;

  label?: string;
  className?: string;

  rows?: number;

  disabled?: boolean;
}

// TODO: Handle the max memo bytes length for each chain.
export const PermissionInput: FunctionComponent<PermissionInputProps> = observer(
  ({ permissionConfig, /*label,*/ className /*, rows, disabled = false*/ }) => {
    /* const [inputId] = useState(() => {
      const bytes = new Uint8Array(4);
      crypto.getRandomValues(bytes);
      return `input-${Buffer.from(bytes).toString("hex")}`;
    }); */

    const [randomId] = useState(() => {
      const bytes = new Uint8Array(4);
      crypto.getRandomValues(bytes);
      return Buffer.from(bytes).toString("hex");
    });

    const [isOpenTokenSelector, setIsOpenTokenSelector] = useState(false);

    const selectablePermissions = permissionConfig.availablePermissions;

    return (
      <FormGroup className={className}>
        <Label
          for={`selector-${randomId}`}
          className="form-control-label"
          style={{ width: "100%" }}
        >
          <FormattedMessage id="component.form.child-account-input.permission.label" />
        </Label>
        <ButtonDropdown
          id={`selector-${randomId}`}
          className={classnames(stylePermissionInput.tokenSelector, {
            disabled: false,
          })}
          isOpen={isOpenTokenSelector}
          toggle={() => setIsOpenTokenSelector((value) => !value)}
          disabled={false}
        >
          <DropdownToggle caret>
            {permissionConfig.selectedPermission.name}
          </DropdownToggle>
          <DropdownMenu>
            {selectablePermissions.map((permission: any) => {
              return (
                <DropdownItem
                  key={permission.name}
                  active={
                    permission.name === permissionConfig.selectedPermission
                  }
                  onClick={(e) => {
                    e.preventDefault();
                    permissionConfig.setPermission(permission);
                  }}
                >
                  {permission.name}
                </DropdownItem>
              );
            })}
          </DropdownMenu>
        </ButtonDropdown>
      </FormGroup>
    );
  }
);
