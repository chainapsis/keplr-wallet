import React, { FunctionComponent } from "react";
import { HeaderLayout } from "../../../../layouts/header";
import { BackButton } from "../../../../layouts/header/components";
import { Stack } from "../../../../components/stack";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { Button } from "../../../../components/button";
import { Box } from "../../../../components/box";

export const SettingSecurityPermissionPage: FunctionComponent = observer(() => {
  const { permissionManagerStore } = useStore();

  // TODO: Handle global permission
  return (
    <HeaderLayout title="General" left={<BackButton />}>
      <Button
        text="Clear all"
        onClick={async () => {
          await permissionManagerStore.clearAllPermissions();
        }}
      />
      <Stack gutter="2rem">
        {Object.entries(permissionManagerStore.permissionData).map(
          ([origin, value]) => {
            if (!value) {
              // Not happen
              return null;
            }

            return (
              <div key={origin}>
                <Button
                  text={origin}
                  onClick={async () => {
                    await permissionManagerStore.clearOrigin(origin);
                  }}
                />
                <Box paddingLeft="1rem">
                  <Stack gutter="1rem">
                    {value.permissions.map((permission) => {
                      if (permission.type !== "basic-access") {
                        console.log("Unknown permission type", permission.type);
                        return null;
                      }

                      return (
                        <Button
                          key={`${permission.chainIdentifier}/${permission.type}`}
                          text={permission.chainIdentifier}
                          onClick={async () => {
                            await permissionManagerStore.removePermission(
                              origin,
                              permission.chainIdentifier,
                              permission.type
                            );
                          }}
                        />
                      );
                    })}
                  </Stack>
                </Box>
              </div>
            );
          }
        )}
      </Stack>
    </HeaderLayout>
  );
});
