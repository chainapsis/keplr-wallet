import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { BackButton } from "../../../../layouts/header/components";
import { HeaderLayout } from "../../../../layouts/header";
import { Stack } from "../../../../components/stack";
import { Box } from "../../../../components/box";
import { PageButton } from "../../components";
import { CheckIcon } from "../../../../components/icon";

export const SettingGeneralLanguagePage: FunctionComponent = observer(() => {
  return (
    <HeaderLayout title="Language" left={<BackButton />}>
      <Box paddingX="0.75rem">
        <Stack gutter="0.5rem">
          <PageButton
            title="Automatic (Browser default)"
            endIcon={<CheckIcon width="1.25rem" height="1.25rem" />}
          />
          <PageButton
            title="English"
            endIcon={<CheckIcon width="1.25rem" height="1.25rem" />}
          />
          <PageButton
            title="Korean"
            endIcon={<CheckIcon width="1.25rem" height="1.25rem" />}
          />
        </Stack>
      </Box>
    </HeaderLayout>
  );
});
