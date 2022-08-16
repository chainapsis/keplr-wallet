import { StyleBuilderDefinitions, StaticStyles } from "./types";
import { StyleSheet } from "react-native";
import { UnionToIntersection, DeepPartial } from "utility-types";
import deepmerge from "deepmerge";
import colorAlpha from "color-alpha";

export class DefinitionKebabCase {
  protected startIndex: number = -1;

  protected _theme: string | undefined;

  constructor(protected readonly _definition: string) {
    const themeColonIndex = this._definition.indexOf(":");
    if (themeColonIndex >= 0) {
      this._theme = this._definition.slice(0, themeColonIndex);
      this._definition = this._definition.slice(themeColonIndex + 1);
    }
  }

  get theme(): string | undefined {
    return this._theme;
  }

  get definition(): string {
    return this._definition;
  }

  peek(): string {
    const index = this._definition.indexOf("-", this.startIndex + 1);
    if (index < 0) {
      return this._definition.slice(this.startIndex + 1);
    }
    return this._definition.slice(this.startIndex + 1, index);
  }

  read(): string {
    const index = this._definition.indexOf("-", this.startIndex + 1);
    if (index < 0) {
      return this.flush();
    }
    const result = this._definition.slice(this.startIndex + 1, index);
    this.startIndex = index;
    return result;
  }

  flush(): string {
    const result = this._definition.slice(this.startIndex + 1);
    this.startIndex = this._definition.length - 1;
    return result;
  }

  segments(): string[] {
    return this._definition.split("-");
  }

  reset() {
    this.startIndex = -1;
  }
}

export type DefinitionsWithThemes<T extends ReadonlyArray<string>, S> = S &
  {
    [K in keyof S as `${T[number]}:${string & K}`]: Partial<S[K]>;
  };

export class StyleBuilder<
  Themes extends ReadonlyArray<string>,
  Custom extends Record<string, unknown>,
  Colors extends Record<string, string>,
  Widths extends Record<string, string | number>,
  Heights extends Record<string, string | number>,
  PaddingSizes extends Record<string, string | number>,
  MarginSizes extends Record<string, string | number>,
  BorderWidths extends Record<string, number>,
  BorderRadiuses extends Record<string, number>,
  Opacities extends Record<string, number>
> {
  protected static readonly ReservedWords: {
    [word: string]: boolean | undefined;
  } = {
    color: true,
    padding: true,
    margin: true,
    top: true,
    bottom: true,
    left: true,
    right: true,
    x: true,
    y: true,
    width: true,
    height: true,
    radius: true,
    flex: true,
    min: true,
    max: true,
    opacity: true,
    solid: true,
    dotted: true,
    dashed: true,
  };

  static readonly checkReservedWord = (config: Record<string, any>) => {
    for (const key in config) {
      const segments = new DefinitionKebabCase(key).segments();
      for (const segment of segments) {
        if (segment.includes("/")) {
          throw new Error(`Confg (${key}) has slash (${segment})`);
        }

        if (segment.includes(":")) {
          throw new Error(`Confg (${key}) has colon (${segment})`);
        }

        if (StyleBuilder.ReservedWords[segment]) {
          throw new Error(`Confg (${key}) has reserved word (${segment})`);
        }
      }
    }
  };

  protected currentConfig: {
    custom: Custom;
    colors: Colors;
    widths: Widths;
    heights: Heights;
    paddingSizes: PaddingSizes;
    marginSizes: MarginSizes;
    borderWidths: BorderWidths;
    borderRadiuses: BorderRadiuses;
    opacities: Opacities;
  };
  protected currentStaticStyles: Record<string, unknown>;

  protected currentTheme: Themes[number] | undefined;

  protected cached: Map<string, any> = new Map();

  constructor(
    protected readonly config: {
      themes: Themes;
      custom: Custom;
      colors: Colors;
      widths: Widths;
      heights: Heights;
      paddingSizes: PaddingSizes;
      marginSizes: MarginSizes;
      borderWidths: BorderWidths;
      borderRadiuses: BorderRadiuses;
      opacities: Opacities;
    },
    protected readonly themeConfigs?: {
      [K in Themes[number]]?: DeepPartial<{
        custom: Custom;
        colors: Colors;
        widths: Widths;
        heights: Heights;
        paddingSizes: PaddingSizes;
        marginSizes: MarginSizes;
        borderWidths: BorderWidths;
        borderRadiuses: BorderRadiuses;
        opacities: Opacities;
      }>;
    }
  ) {
    // Don't need to check the static styles because it is prioritized than dynamic styles.
    if (__DEV__) {
      StyleBuilder.checkReservedWord(config.colors);
      StyleBuilder.checkReservedWord(config.widths);
      StyleBuilder.checkReservedWord(config.heights);
      StyleBuilder.checkReservedWord(config.paddingSizes);
      StyleBuilder.checkReservedWord(config.marginSizes);
      StyleBuilder.checkReservedWord(config.borderWidths);
      StyleBuilder.checkReservedWord(config.borderRadiuses);
      StyleBuilder.checkReservedWord(config.opacities);

      if (themeConfigs) {
        for (const theme of Object.keys(themeConfigs)) {
          const themeConfig = themeConfigs[theme as Themes[number]];
          if (themeConfig) {
            StyleBuilder.checkReservedWord(themeConfig.colors ?? {});
            StyleBuilder.checkReservedWord(themeConfig.widths ?? {});
            StyleBuilder.checkReservedWord(themeConfig.heights ?? {});
            StyleBuilder.checkReservedWord(themeConfig.paddingSizes ?? {});
            StyleBuilder.checkReservedWord(themeConfig.marginSizes ?? {});
            StyleBuilder.checkReservedWord(themeConfig.borderWidths ?? {});
            StyleBuilder.checkReservedWord(themeConfig.borderRadiuses ?? {});
            StyleBuilder.checkReservedWord(themeConfig.opacities ?? {});
          }
        }
      }
    }

    // Initially, no theme is set.
    this.currentStaticStyles = {
      ...config.custom,
      ...StaticStyles,
    };

    // Initially, no theme is set.
    this.currentConfig = config;
  }

  get theme(): Themes[number] | undefined {
    return this.currentTheme;
  }

  setTheme(theme: Themes[number] | undefined) {
    if (this.currentTheme !== theme) {
      // When the theme changes, clear all caches and others should be reinitialized.
      this.cached = new Map();

      const themeConfig =
        this.themeConfigs && theme ? this.themeConfigs[theme] : {};

      const config = deepmerge(this.config, themeConfig ?? {}, {
        arrayMerge: (_, source) => source,
      });

      this.currentStaticStyles = {
        ...config.custom,
        ...StaticStyles,
      };

      this.currentConfig = config;

      this.currentTheme = theme;
    }
  }

  flatten<
    D extends DefinitionsWithThemes<
      Themes,
      StyleBuilderDefinitions<
        Custom,
        Colors,
        Widths,
        Heights,
        PaddingSizes,
        MarginSizes,
        BorderWidths,
        BorderRadiuses,
        Opacities
      >
    >,
    K extends keyof D
  >(definitions: K[]): UnionToIntersection<D[K]>;

  flatten<
    D extends DefinitionsWithThemes<
      Themes,
      StyleBuilderDefinitions<
        Custom,
        Colors,
        Widths,
        Heights,
        PaddingSizes,
        MarginSizes,
        BorderWidths,
        BorderRadiuses,
        Opacities
      >
    >,
    K extends keyof D,
    ConditionalK extends keyof D
  >(
    definitions: K[],
    conditionalDefinitions: (ConditionalK | null | undefined | boolean)[]
  ): UnionToIntersection<D[K]> & Partial<UnionToIntersection<D[ConditionalK]>>;

  flatten<
    D extends DefinitionsWithThemes<
      Themes,
      StyleBuilderDefinitions<
        Custom,
        Colors,
        Widths,
        Heights,
        PaddingSizes,
        MarginSizes,
        BorderWidths,
        BorderRadiuses,
        Opacities
      >
    >,
    K extends keyof D,
    ConditionalK extends keyof D
  >(
    definitions: K[],
    conditionalDefinitions: (ConditionalK | null | undefined | boolean)[] = []
  ): UnionToIntersection<D[K]> & Partial<UnionToIntersection<D[ConditionalK]>> {
    const styles: any[] = [];
    for (const definition of definitions) {
      styles.push(this.get<D, K>(definition));
    }
    for (const definition of conditionalDefinitions) {
      if (definition && definition !== true) {
        styles.push(this.get<D, K>((definition as unknown) as K));
      }
    }
    return StyleSheet.flatten(styles);
  }

  protected calculateColorDefinition(definition: string): string {
    const index = definition.indexOf("@");
    if (index >= 0) {
      const str = definition.slice(index + 1);
      if (str.length === 0 || str[str.length - 1] !== "%") {
        throw new Error(`Invalid color definition with alpha: ${definition}`);
      }

      const alpha = parseFloat(str.slice(0, str.length - 1));
      if (Number.isNaN(alpha)) {
        throw new Error(`Invalid color definition with alpha: ${definition}`);
      }

      if (alpha < 0 || alpha > 100) {
        throw new Error(`Alpha is out of range: ${definition}`);
      }

      const color = definition.slice(0, index);

      return colorAlpha(this.currentConfig.colors[color], alpha / 100);
    }

    return this.currentConfig.colors[definition];
  }

  get<
    D extends DefinitionsWithThemes<
      Themes,
      StyleBuilderDefinitions<
        Custom,
        Colors,
        Widths,
        Heights,
        PaddingSizes,
        MarginSizes,
        BorderWidths,
        BorderRadiuses,
        Opacities
      >
    >,
    K extends keyof D
  >(definition: K): D[K] {
    return this.getAndCache(definition as string, this.compute);
  }

  protected readonly compute = (definition: string): any => {
    const segment = new DefinitionKebabCase(definition as string);

    if (segment.theme && segment.theme !== this.theme) {
      return {};
    }

    if (segment.definition in this.currentStaticStyles) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return this.currentStaticStyles[segment.definition];
    }

    switch (segment.read()) {
      case "color":
        return {
          color: this.calculateColorDefinition(segment.flush()),
        };
      case "background":
        if (segment.read() === "color") {
          return {
            backgroundColor: this.calculateColorDefinition(segment.flush()),
          };
        }
        throw new Error(`Failed to get style of ${definition}`);
      case "width":
        return {
          width: this.currentConfig.widths[segment.flush()],
        };
      case "height":
        return {
          height: this.currentConfig.heights[segment.flush()],
        };
      case "min":
        switch (segment.read()) {
          case "width":
            return {
              minWidth: this.currentConfig.widths[segment.flush()],
            };
          case "height":
            return {
              minHeight: this.currentConfig.heights[segment.flush()],
            };
        }
        throw new Error(`Failed to get style of ${definition}`);
      case "max":
        switch (segment.read()) {
          case "width":
            return {
              maxWidth: this.currentConfig.widths[segment.flush()],
            };
          case "height":
            return {
              maxHeight: this.currentConfig.heights[segment.flush()],
            };
        }
        throw new Error(`Failed to get style of ${definition}`);
      case "border":
        switch (segment.read()) {
          case "color":
            return {
              borderColor: this.calculateColorDefinition(segment.flush()),
            };
          case "width":
            switch (segment.peek()) {
              case "left":
                segment.read();
                return {
                  borderLeftWidth: this.currentConfig.borderWidths[
                    segment.flush()
                  ],
                };
              case "right":
                segment.read();
                return {
                  borderRightWidth: this.currentConfig.borderWidths[
                    segment.flush()
                  ],
                };
              case "top":
                segment.read();
                return {
                  borderTopWidth: this.currentConfig.borderWidths[
                    segment.flush()
                  ],
                };
              case "bottom":
                segment.read();
                return {
                  borderBottomWidth: this.currentConfig.borderWidths[
                    segment.flush()
                  ],
                };
            }

            return {
              borderWidth: this.currentConfig.borderWidths[segment.flush()],
            };
          case "radius":
            switch (segment.peek()) {
              case "top":
                segment.read();
                switch (segment.read()) {
                  case "left": {
                    return {
                      borderTopLeftRadius: this.currentConfig.borderRadiuses[
                        segment.flush()
                      ],
                    };
                  }
                  case "right": {
                    return {
                      borderTopRightRadius: this.currentConfig.borderRadiuses[
                        segment.flush()
                      ],
                    };
                  }
                }
                throw new Error(`Failed to get style of ${definition}`);
              case "bottom":
                segment.read();
                switch (segment.read()) {
                  case "left": {
                    return {
                      borderBottomLeftRadius: this.currentConfig.borderRadiuses[
                        segment.flush()
                      ],
                    };
                  }
                  case "right": {
                    return {
                      borderBottomRightRadius: this.currentConfig
                        .borderRadiuses[segment.flush()],
                    };
                  }
                }
                throw new Error(`Failed to get style of ${definition}`);
            }

            const borderRadius = this.currentConfig.borderRadiuses[
              segment.flush()
            ];
            return {
              borderTopLeftRadius: borderRadius,
              borderTopRightRadius: borderRadius,
              borderBottomLeftRadius: borderRadius,
              borderBottomRightRadius: borderRadius,
            };
        }

        throw new Error(`Failed to get style of ${definition}`);
      case "padding":
        switch (segment.peek()) {
          case "left":
            segment.read();
            return {
              paddingLeft: this.currentConfig.paddingSizes[segment.flush()],
            };
          case "right":
            segment.read();
            return {
              paddingRight: this.currentConfig.paddingSizes[segment.flush()],
            };
          case "top":
            segment.read();
            return {
              paddingTop: this.currentConfig.paddingSizes[segment.flush()],
            };
          case "bottom":
            segment.read();
            return {
              paddingBottom: this.currentConfig.paddingSizes[segment.flush()],
            };
          case "x":
            segment.read();
            const keyX = segment.flush();
            return {
              paddingLeft: this.currentConfig.paddingSizes[keyX],
              paddingRight: this.currentConfig.paddingSizes[keyX],
            };
          case "y":
            segment.read();
            const keyY = segment.flush();
            return {
              paddingTop: this.currentConfig.paddingSizes[keyY],
              paddingBottom: this.currentConfig.paddingSizes[keyY],
            };
        }

        const padding = this.currentConfig.paddingSizes[segment.flush()];
        return {
          paddingTop: padding,
          paddingBottom: padding,
          paddingLeft: padding,
          paddingRight: padding,
        };
      case "margin":
        switch (segment.peek()) {
          case "left":
            segment.read();
            return {
              marginLeft: this.currentConfig.marginSizes[segment.flush()],
            };
          case "right":
            segment.read();
            return {
              marginRight: this.currentConfig.marginSizes[segment.flush()],
            };
          case "top":
            segment.read();
            return {
              marginTop: this.currentConfig.marginSizes[segment.flush()],
            };
          case "bottom":
            segment.read();
            return {
              marginBottom: this.currentConfig.marginSizes[segment.flush()],
            };
          case "x":
            segment.read();
            const keyX = segment.flush();
            return {
              marginLeft: this.currentConfig.marginSizes[keyX],
              marginRight: this.currentConfig.marginSizes[keyX],
            };
          case "y":
            segment.read();
            const keyY = segment.flush();
            return {
              marginTop: this.currentConfig.marginSizes[keyY],
              marginBottom: this.currentConfig.marginSizes[keyY],
            };
        }

        const margin = this.currentConfig.marginSizes[segment.flush()];
        return {
          marginTop: margin,
          marginBottom: margin,
          marginLeft: margin,
          marginRight: margin,
        };
      case "opacity":
        return {
          opacity: this.currentConfig.opacities[segment.flush()],
        };
    }

    throw new Error(`Failed to get style of ${definition}`);
  };

  protected getAndCache(key: string, creator: (key: string) => any): any {
    let value = this.cached.get(key);
    if (value) {
      return value;
    }

    value = creator(key);
    this.cached.set(key, value);
    return value;
  }
}
