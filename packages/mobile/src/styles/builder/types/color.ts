export type StyleBuilderColorDefinitions<
  Colors extends Record<string, string>
> = {
  [K in keyof Colors as `color-${string & K}`]: {
    color: string;
  };
} &
  {
    [K in keyof Colors as `background-color-${string & K}`]: {
      backgroundColor: string;
    };
  } &
  {
    [K in keyof Colors as `border-color-${string & K}`]: {
      borderColor: string;
    };
  };
