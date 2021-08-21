import { StyleBuilderDefinitions, StaticStyles } from "./types";
import { StyleSheet } from "react-native";
import { UnionToIntersection } from "utility-types";

export class DefinitionKebabCase {
  protected startIndex: number = -1;

  constructor(protected readonly definition: string) {}

  peek(): string {
    const index = this.definition.indexOf("-", this.startIndex + 1);
    if (index < 0) {
      return this.definition.slice(this.startIndex + 1);
    }
    return this.definition.slice(this.startIndex + 1, index);
  }

  read(): string {
    const index = this.definition.indexOf("-", this.startIndex + 1);
    if (index < 0) {
      return this.flush();
    }
    const result = this.definition.slice(this.startIndex + 1, index);
    this.startIndex = index;
    return result;
  }

  flush(): string {
    const result = this.definition.slice(this.startIndex + 1);
    this.startIndex = this.definition.length - 1;
    return result;
  }

  segments(): string[] {
    return this.definition.split("-");
  }

  reset() {
    this.startIndex = -1;
  }
}

export class StyleBuilder<
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
        if (StyleBuilder.ReservedWords[segment]) {
          throw new Error(`Confg (${key}) has reserved word (${segment})`);
        }
      }
    }
  };

  protected readonly staticStyles: Record<string, unknown>;

  protected readonly cached: Map<string, any> = new Map();

  constructor(
    protected readonly configs: {
      custom: Custom;
      colors: Colors;
      widths: Widths;
      heights: Heights;
      paddingSizes: PaddingSizes;
      marginSizes: MarginSizes;
      borderWidths: BorderWidths;
      borderRadiuses: BorderRadiuses;
      opacities: Opacities;
    }
  ) {
    // TODO: Disable checking on the production environment.
    // Don't need to check the static styles because it is prioritized than dynamic styles.
    StyleBuilder.checkReservedWord(configs.colors);
    StyleBuilder.checkReservedWord(configs.widths);
    StyleBuilder.checkReservedWord(configs.heights);
    StyleBuilder.checkReservedWord(configs.paddingSizes);
    StyleBuilder.checkReservedWord(configs.marginSizes);
    StyleBuilder.checkReservedWord(configs.borderWidths);
    StyleBuilder.checkReservedWord(configs.borderRadiuses);
    StyleBuilder.checkReservedWord(configs.opacities);

    this.staticStyles = {
      ...configs.custom,
      ...StaticStyles,
    };
  }

  flatten<
    D extends StyleBuilderDefinitions<
      Custom,
      Colors,
      Widths,
      Heights,
      PaddingSizes,
      MarginSizes,
      BorderWidths,
      BorderRadiuses,
      Opacities
    >,
    K extends keyof D
  >(definitions: K[]): UnionToIntersection<D[K]>;

  flatten<
    D extends StyleBuilderDefinitions<
      Custom,
      Colors,
      Widths,
      Heights,
      PaddingSizes,
      MarginSizes,
      BorderWidths,
      BorderRadiuses,
      Opacities
    >,
    K extends keyof D,
    ConditionalK extends keyof D
  >(
    definitions: K[],
    conditionalDefinitions: (ConditionalK | null | undefined | boolean)[]
  ): UnionToIntersection<D[K]> & Partial<UnionToIntersection<D[ConditionalK]>>;

  flatten<
    D extends StyleBuilderDefinitions<
      Custom,
      Colors,
      Widths,
      Heights,
      PaddingSizes,
      MarginSizes,
      BorderWidths,
      BorderRadiuses,
      Opacities
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

  get<
    D extends StyleBuilderDefinitions<
      Custom,
      Colors,
      Widths,
      Heights,
      PaddingSizes,
      MarginSizes,
      BorderWidths,
      BorderRadiuses,
      Opacities
    >,
    K extends keyof D
  >(definition: K): D[K] {
    return this.getAndCache(definition as string, this.compute);
  }

  protected readonly compute = (definition: string): any => {
    if (definition in this.staticStyles) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return this.staticStyles[definition];
    }

    const segment = new DefinitionKebabCase(definition as string);

    switch (segment.read()) {
      case "color":
        return {
          color: this.configs.colors[segment.flush()],
        };
      case "background":
        if (segment.read() === "color") {
          return {
            backgroundColor: this.configs.colors[segment.flush()],
          };
        }
        throw new Error(`Failed to get style of ${definition}`);
      case "width":
        return {
          width: this.configs.widths[segment.flush()],
        };
      case "height":
        return {
          height: this.configs.heights[segment.flush()],
        };
      case "min":
        switch (segment.read()) {
          case "width":
            return {
              minWidth: this.configs.widths[segment.flush()],
            };
          case "height":
            return {
              minHeight: this.configs.heights[segment.flush()],
            };
        }
        throw new Error(`Failed to get style of ${definition}`);
      case "max":
        switch (segment.read()) {
          case "width":
            return {
              maxWidth: this.configs.widths[segment.flush()],
            };
          case "height":
            return {
              maxHeight: this.configs.heights[segment.flush()],
            };
        }
        throw new Error(`Failed to get style of ${definition}`);
      case "border":
        switch (segment.read()) {
          case "color":
            return {
              borderColor: this.configs.colors[segment.flush()],
            };
          case "width":
            switch (segment.peek()) {
              case "left":
                segment.read();
                return {
                  borderLeftWidth: this.configs.borderWidths[segment.flush()],
                };
              case "right":
                segment.read();
                return {
                  borderRightWidth: this.configs.borderWidths[segment.flush()],
                };
              case "top":
                segment.read();
                return {
                  borderTopWidth: this.configs.borderWidths[segment.flush()],
                };
              case "bottom":
                segment.read();
                return {
                  borderBottomWidth: this.configs.borderWidths[segment.flush()],
                };
            }

            return {
              borderWidth: this.configs.borderWidths[segment.flush()],
            };
          case "radius":
            switch (segment.peek()) {
              case "top":
                segment.read();
                switch (segment.read()) {
                  case "left": {
                    return {
                      borderTopLeftRadius: this.configs.borderRadiuses[
                        segment.flush()
                      ],
                    };
                  }
                  case "right": {
                    return {
                      borderTopRightRadius: this.configs.borderRadiuses[
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
                      borderBottomLeftRadius: this.configs.borderRadiuses[
                        segment.flush()
                      ],
                    };
                  }
                  case "right": {
                    return {
                      borderBottomRightRadius: this.configs.borderRadiuses[
                        segment.flush()
                      ],
                    };
                  }
                }
                throw new Error(`Failed to get style of ${definition}`);
            }

            const borderRadius = this.configs.borderRadiuses[segment.flush()];
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
              paddingLeft: this.configs.paddingSizes[segment.flush()],
            };
          case "right":
            segment.read();
            return {
              paddingRight: this.configs.paddingSizes[segment.flush()],
            };
          case "top":
            segment.read();
            return {
              paddingTop: this.configs.paddingSizes[segment.flush()],
            };
          case "bottom":
            segment.read();
            return {
              paddingBottom: this.configs.paddingSizes[segment.flush()],
            };
          case "x":
            segment.read();
            const keyX = segment.flush();
            return {
              paddingLeft: this.configs.paddingSizes[keyX],
              paddingRight: this.configs.paddingSizes[keyX],
            };
          case "y":
            segment.read();
            const keyY = segment.flush();
            return {
              paddingTop: this.configs.paddingSizes[keyY],
              paddingBottom: this.configs.paddingSizes[keyY],
            };
        }

        const padding = this.configs.paddingSizes[segment.flush()];
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
              marginLeft: this.configs.marginSizes[segment.flush()],
            };
          case "right":
            segment.read();
            return {
              marginRight: this.configs.marginSizes[segment.flush()],
            };
          case "top":
            segment.read();
            return {
              marginTop: this.configs.marginSizes[segment.flush()],
            };
          case "bottom":
            segment.read();
            return {
              marginBottom: this.configs.marginSizes[segment.flush()],
            };
          case "x":
            segment.read();
            const keyX = segment.flush();
            return {
              marginLeft: this.configs.marginSizes[keyX],
              marginRight: this.configs.marginSizes[keyX],
            };
          case "y":
            segment.read();
            const keyY = segment.flush();
            return {
              marginTop: this.configs.marginSizes[keyY],
              marginBottom: this.configs.marginSizes[keyY],
            };
        }

        const margin = this.configs.marginSizes[segment.flush()];
        return {
          marginTop: margin,
          marginBottom: margin,
          marginLeft: margin,
          marginRight: margin,
        };
      case "opacity":
        return {
          opacity: this.configs.opacities[segment.flush()],
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
