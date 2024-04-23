export type StyleBuilderGapDefinitions<Gaps extends Record<string, number>> = {
  [K in keyof Gaps as `gap-${string & K}`]: {
    gap: number;
  };
};
