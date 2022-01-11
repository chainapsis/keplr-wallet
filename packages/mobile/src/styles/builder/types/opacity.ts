export type StyleBuilderOpacityDefinitions<
  Opacities extends Record<string, number>
> = {
  [K in keyof Opacities as `opacity-${string & K}`]: {
    opacity: number;
  };
};
