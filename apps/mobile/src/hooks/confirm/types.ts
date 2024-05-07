import React from 'react';

export interface Confirm {
  confirm: (
    title: string,
    paragraph: string | React.ReactNode,
    options?: {
      forceYes?: boolean;
      yesText?: string;
    },
  ) => Promise<boolean>;
}
