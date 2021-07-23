import { StyleBuilder, DefinitionKebabCase } from "./builder";

describe("Test style builder", () => {
  const builder = new StyleBuilder({
    custom: {
      test: {
        fontSize: 20,
      },
      test2: {
        fontSize: 22,
      },
    },
    colors: {
      primary: "#FFFFFF",
      secondary: "#AAAAAA",
      "secondary-200": "#222222",
    },
    widths: {
      "10": 10,
      full: "100%",
    },
    heights: {
      "50": 50,
      full: "100%",
    },
    paddingSizes: {
      "10": 1,
      small: "2",
    },
    marginSizes: {
      "1": 3,
      medium: "4",
    },
    borderWidths: {
      "1": 1,
      small: 10,
    },
    borderRadiuses: {
      "123": 123,
      big: 1000,
    },
    opacities: {
      "10": 0.1,
      "100": 1,
    },
  });

  test("Test Kebab case definition", () => {
    const definition = new DefinitionKebabCase("test1-test2-test3-test4");
    for (let i = 0; i < 4; i++) {
      // Read method should return the segment of the kebab case string and don't move forward to the next segment.
      expect(definition.peek()).toBe(`test${i + 1}`);
      // Read method should return the segment of the kebab case string and move forward to the next segment.
      expect(definition.read()).toBe(`test${i + 1}`);
    }
    // If defintion doesn't have remaining segment, just return empty string
    expect(definition.peek()).toBe("");
    expect(definition.read()).toBe("");

    definition.reset();
    // Flush method should return the remaining string without considering the segment and move forward to the end.
    expect(definition.flush()).toBe("test1-test2-test3-test4");
    expect(definition.read()).toBe("");

    definition.reset();
    expect(definition.read()).toBe("test1");
    // Flush method should return the remaining string without considering the segment and move forward to the end.
    expect(definition.flush()).toBe("test2-test3-test4");
    expect(definition.read()).toBe("");
  });

  test("Throw an error if config has the reserved word", () => {
    expect(() => {
      new StyleBuilder({
        custom: {},
        colors: {
          primary: "#FFFFFF",
          secondary: "#AAAAAA",
          secondary200: "#222222",
          // Reserved word
          color: "should throw error",
        },
        widths: {
          "10": 10,
          full: "100%",
        },
        heights: {
          "50": 50,
          full: "100%",
        },
        paddingSizes: {
          "10": "1",
          small: "2",
        },
        marginSizes: {
          "1": "3",
          medium: "4",
        },
        borderWidths: {
          "1": 1,
          small: 10,
        },
        borderRadiuses: {
          "123": 123,
          big: 1000,
        },
        opacities: {
          "10": 0.1,
          "100": 1,
        },
      });
    }).toThrow();

    expect(() => {
      new StyleBuilder({
        custom: {},
        colors: {
          primary: "#FFFFFF",
          secondary: "#AAAAAA",
          secondary200: "#222222",
          // Reserved word
          ["asdf-solid"]: "should throw error",
        },
        widths: {
          "10": 10,
          full: "100%",
        },
        heights: {
          "50": 50,
          full: "100%",
        },
        paddingSizes: {
          "10": "1",
          small: "2",
        },
        marginSizes: {
          "1": "3",
          medium: "4",
        },
        borderWidths: {
          "1": 1,
          small: 10,
        },
        borderRadiuses: {
          "123": 123,
          big: 1000,
        },
        opacities: {
          "10": 0.1,
          "100": 1,
        },
      });
    }).toThrow();
  });

  test("Test Custom", () => {
    expect(builder.get("test")).toStrictEqual({
      fontSize: 20,
    });
  });

  test("Test Flatten", () => {
    expect(builder.flatten(["test", "flex"])).toStrictEqual({
      fontSize: 20,
      display: "flex",
    });
  });

  test("Test Conditional Flatten", () => {
    expect(builder.flatten(["test"], [false])).toStrictEqual({
      fontSize: 20,
    });

    expect(
      builder.flatten(
        ["test", "absolute", "test2"],
        [null, undefined, false, true]
      )
    ).toStrictEqual({
      position: "absolute",
      fontSize: 22,
    });

    expect(
      builder.flatten(["test", "absolute"], ["test2", undefined, false, true])
    ).toStrictEqual({
      position: "absolute",
      fontSize: 22,
    });

    expect(
      builder.flatten(["test", "absolute"], [null, undefined, "test2", true])
    ).toStrictEqual({
      position: "absolute",
      fontSize: 22,
    });

    expect(
      builder.flatten(["absolute"], [null, undefined, "test2", true])
    ).toStrictEqual({
      position: "absolute",
      fontSize: 22,
    });

    expect(
      builder.flatten(["absolute"], ["test", undefined, "test2", true])
    ).toStrictEqual({
      position: "absolute",
      fontSize: 22,
    });
  });

  test("Test Display", () => {
    expect(builder.get("flex")).toStrictEqual({
      display: "flex",
    });
    expect(builder.get("display-none")).toStrictEqual({
      display: "none",
    });
  });

  test("Test Position", () => {
    expect(builder.get("absolute")).toStrictEqual({
      position: "absolute",
    });
    expect(builder.get("absolute-fill")).toStrictEqual({
      position: "absolute",
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    });
    expect(builder.get("relative")).toStrictEqual({
      position: "relative",
    });

    for (let i = 0; i <= 10; i++) {
      expect(builder.get(`flex-${i}` as any)).toStrictEqual({
        flex: i,
      });
    }

    expect(builder.get("flex-row")).toStrictEqual({
      flexDirection: "row",
    });
    expect(builder.get("flex-column")).toStrictEqual({
      flexDirection: "column",
    });
    expect(builder.get("flex-row-reverse")).toStrictEqual({
      flexDirection: "row-reverse",
    });
    expect(builder.get("flex-wrap")).toStrictEqual({
      flexWrap: "wrap",
    });
    expect(builder.get("flex-wrap-reverse")).toStrictEqual({
      flexWrap: "wrap-reverse",
    });
    expect(builder.get("flex-nowrap")).toStrictEqual({
      flexWrap: "nowrap",
    });
    expect(builder.get("flex-column-reverse")).toStrictEqual({
      flexDirection: "column-reverse",
    });

    expect(builder.get("content-start")).toStrictEqual({
      alignContent: "flex-start",
    });
    expect(builder.get("content-center")).toStrictEqual({
      alignContent: "center",
    });
    expect(builder.get("content-end")).toStrictEqual({
      alignContent: "flex-end",
    });
    expect(builder.get("content-stretch")).toStrictEqual({
      alignContent: "stretch",
    });
    expect(builder.get("content-between")).toStrictEqual({
      alignContent: "space-between",
    });
    expect(builder.get("content-around")).toStrictEqual({
      alignContent: "space-around",
    });

    expect(builder.get("items-start")).toStrictEqual({
      alignItems: "flex-start",
    });
    expect(builder.get("items-center")).toStrictEqual({
      alignItems: "center",
    });
    expect(builder.get("items-end")).toStrictEqual({
      alignItems: "flex-end",
    });
    expect(builder.get("items-stretch")).toStrictEqual({
      alignItems: "stretch",
    });
    expect(builder.get("items-baseline")).toStrictEqual({
      alignItems: "baseline",
    });

    expect(builder.get("self-auto")).toStrictEqual({
      alignSelf: "auto",
    });
    expect(builder.get("self-start")).toStrictEqual({
      alignSelf: "flex-start",
    });
    expect(builder.get("self-center")).toStrictEqual({
      alignSelf: "center",
    });
    expect(builder.get("self-end")).toStrictEqual({
      alignSelf: "flex-end",
    });
    expect(builder.get("self-stretch")).toStrictEqual({
      alignSelf: "stretch",
    });
    expect(builder.get("self-baseline")).toStrictEqual({
      alignSelf: "baseline",
    });

    expect(builder.get("justify-start")).toStrictEqual({
      justifyContent: "flex-start",
    });
    expect(builder.get("justify-center")).toStrictEqual({
      justifyContent: "center",
    });
    expect(builder.get("justify-end")).toStrictEqual({
      justifyContent: "flex-end",
    });
    expect(builder.get("justify-between")).toStrictEqual({
      justifyContent: "space-between",
    });
    expect(builder.get("justify-around")).toStrictEqual({
      justifyContent: "space-around",
    });
    expect(builder.get("justify-evenly")).toStrictEqual({
      justifyContent: "space-evenly",
    });

    expect(builder.get("overflow-visible")).toStrictEqual({
      overflow: "visible",
    });
    expect(builder.get("overflow-hidden")).toStrictEqual({
      overflow: "hidden",
    });
    expect(builder.get("overflow-scroll")).toStrictEqual({
      overflow: "scroll",
    });
  });

  test("Test Color", () => {
    expect(builder.get("color-primary")).toStrictEqual({
      color: "#FFFFFF",
    });
    expect(builder.get("color-secondary")).toStrictEqual({
      color: "#AAAAAA",
    });
    expect(builder.get("color-secondary-200")).toStrictEqual({
      color: "#222222",
    });

    expect(builder.get("background-color-primary")).toStrictEqual({
      backgroundColor: "#FFFFFF",
    });
    expect(builder.get("background-color-secondary")).toStrictEqual({
      backgroundColor: "#AAAAAA",
    });
    expect(builder.get("background-color-secondary-200")).toStrictEqual({
      backgroundColor: "#222222",
    });

    expect(builder.get("border-color-primary")).toStrictEqual({
      borderColor: "#FFFFFF",
    });
    expect(builder.get("border-color-secondary")).toStrictEqual({
      borderColor: "#AAAAAA",
    });
    expect(builder.get("border-color-secondary-200")).toStrictEqual({
      borderColor: "#222222",
    });
  });

  test("Test Sizing", () => {
    expect(builder.get("width-10")).toStrictEqual({
      width: 10,
    });
    expect(builder.get("min-width-10")).toStrictEqual({
      minWidth: 10,
    });
    expect(builder.get("max-width-10")).toStrictEqual({
      maxWidth: 10,
    });
    expect(builder.get("width-full")).toStrictEqual({
      width: "100%",
    });
    expect(builder.get("min-width-full")).toStrictEqual({
      minWidth: "100%",
    });
    expect(builder.get("max-width-full")).toStrictEqual({
      maxWidth: "100%",
    });

    expect(builder.get("height-50")).toStrictEqual({
      height: 50,
    });
    expect(builder.get("min-height-50")).toStrictEqual({
      minHeight: 50,
    });
    expect(builder.get("max-height-50")).toStrictEqual({
      maxHeight: 50,
    });
    expect(builder.get("height-full")).toStrictEqual({
      height: "100%",
    });
    expect(builder.get("min-height-full")).toStrictEqual({
      minHeight: "100%",
    });
    expect(builder.get("max-height-full")).toStrictEqual({
      maxHeight: "100%",
    });
  });

  test("Test Border Style", () => {
    expect(builder.get("border-solid")).toStrictEqual({
      borderStyle: "solid",
    });
    expect(builder.get("border-dashed")).toStrictEqual({
      borderStyle: "dashed",
    });
    expect(builder.get("border-dotted")).toStrictEqual({
      borderStyle: "dotted",
    });
  });

  test("Test Border Width", () => {
    expect(builder.get("border-width-1")).toStrictEqual({
      borderWidth: 1,
    });
    expect(builder.get("border-width-small")).toStrictEqual({
      borderWidth: 10,
    });
    expect(builder.get("border-width-left-1")).toStrictEqual({
      borderLeftWidth: 1,
    });
    expect(builder.get("border-width-left-small")).toStrictEqual({
      borderLeftWidth: 10,
    });
    expect(builder.get("border-width-right-1")).toStrictEqual({
      borderRightWidth: 1,
    });
    expect(builder.get("border-width-right-small")).toStrictEqual({
      borderRightWidth: 10,
    });
    expect(builder.get("border-width-top-1")).toStrictEqual({
      borderTopWidth: 1,
    });
    expect(builder.get("border-width-top-small")).toStrictEqual({
      borderTopWidth: 10,
    });
    expect(builder.get("border-width-bottom-1")).toStrictEqual({
      borderBottomWidth: 1,
    });
    expect(builder.get("border-width-bottom-small")).toStrictEqual({
      borderBottomWidth: 10,
    });
  });

  test("Test Border Radius", () => {
    expect(builder.get("border-radius-123")).toStrictEqual({
      borderRadius: 123,
    });
    expect(builder.get("border-radius-big")).toStrictEqual({
      borderRadius: 1000,
    });
    expect(builder.get("border-radius-top-left-123")).toStrictEqual({
      borderTopLeftRadius: 123,
    });
    expect(builder.get("border-radius-top-left-big")).toStrictEqual({
      borderTopLeftRadius: 1000,
    });
    expect(builder.get("border-radius-top-right-123")).toStrictEqual({
      borderTopRightRadius: 123,
    });
    expect(builder.get("border-radius-top-right-big")).toStrictEqual({
      borderTopRightRadius: 1000,
    });
    expect(builder.get("border-radius-bottom-left-123")).toStrictEqual({
      borderBottomLeftRadius: 123,
    });
    expect(builder.get("border-radius-bottom-left-big")).toStrictEqual({
      borderBottomLeftRadius: 1000,
    });
    expect(builder.get("border-radius-bottom-right-123")).toStrictEqual({
      borderBottomRightRadius: 123,
    });
    expect(builder.get("border-radius-bottom-right-big")).toStrictEqual({
      borderBottomRightRadius: 1000,
    });
  });

  test("Test Padding", () => {
    expect(builder.get("padding-10")).toStrictEqual({
      paddingTop: 1,
      paddingBottom: 1,
      paddingLeft: 1,
      paddingRight: 1,
    });
    expect(builder.get("padding-small")).toStrictEqual({
      paddingTop: "2",
      paddingBottom: "2",
      paddingLeft: "2",
      paddingRight: "2",
    });
    expect(builder.get("padding-left-10")).toStrictEqual({
      paddingLeft: 1,
    });
    expect(builder.get("padding-left-small")).toStrictEqual({
      paddingLeft: "2",
    });
    expect(builder.get("padding-right-10")).toStrictEqual({
      paddingRight: 1,
    });
    expect(builder.get("padding-right-small")).toStrictEqual({
      paddingRight: "2",
    });
    expect(builder.get("padding-top-10")).toStrictEqual({
      paddingTop: 1,
    });
    expect(builder.get("padding-top-small")).toStrictEqual({
      paddingTop: "2",
    });
    expect(builder.get("padding-bottom-10")).toStrictEqual({
      paddingBottom: 1,
    });
    expect(builder.get("padding-bottom-small")).toStrictEqual({
      paddingBottom: "2",
    });
    expect(builder.get("padding-x-10")).toStrictEqual({
      paddingLeft: 1,
      paddingRight: 1,
    });
    expect(builder.get("padding-x-small")).toStrictEqual({
      paddingLeft: "2",
      paddingRight: "2",
    });
    expect(builder.get("padding-y-10")).toStrictEqual({
      paddingTop: 1,
      paddingBottom: 1,
    });
    expect(builder.get("padding-y-small")).toStrictEqual({
      paddingTop: "2",
      paddingBottom: "2",
    });
  });

  test("Test Margin", () => {
    expect(builder.get("margin-1")).toStrictEqual({
      marginTop: 3,
      marginBottom: 3,
      marginLeft: 3,
      marginRight: 3,
    });
    expect(builder.get("margin-medium")).toStrictEqual({
      marginTop: "4",
      marginBottom: "4",
      marginLeft: "4",
      marginRight: "4",
    });
    expect(builder.get("margin-left-1")).toStrictEqual({
      marginLeft: 3,
    });
    expect(builder.get("margin-left-medium")).toStrictEqual({
      marginLeft: "4",
    });
    expect(builder.get("margin-right-1")).toStrictEqual({
      marginRight: 3,
    });
    expect(builder.get("margin-right-medium")).toStrictEqual({
      marginRight: "4",
    });
    expect(builder.get("margin-top-1")).toStrictEqual({
      marginTop: 3,
    });
    expect(builder.get("margin-top-medium")).toStrictEqual({
      marginTop: "4",
    });
    expect(builder.get("margin-bottom-1")).toStrictEqual({
      marginBottom: 3,
    });
    expect(builder.get("margin-bottom-medium")).toStrictEqual({
      marginBottom: "4",
    });
    expect(builder.get("margin-x-1")).toStrictEqual({
      marginLeft: 3,
      marginRight: 3,
    });
    expect(builder.get("margin-x-medium")).toStrictEqual({
      marginLeft: "4",
      marginRight: "4",
    });
    expect(builder.get("margin-y-1")).toStrictEqual({
      marginTop: 3,
      marginBottom: 3,
    });
    expect(builder.get("margin-y-medium")).toStrictEqual({
      marginTop: "4",
      marginBottom: "4",
    });
  });

  test("Test Opacity", () => {
    expect(builder.get("opacity-10")).toStrictEqual({
      opacity: 0.1,
    });
    expect(builder.get("opacity-100")).toStrictEqual({
      opacity: 1,
    });
  });

  test("Test Resize mode", () => {
    expect(builder.get("resize-cover")).toStrictEqual({
      resizeMode: "cover",
    });
    expect(builder.get("resize-contain")).toStrictEqual({
      resizeMode: "contain",
    });
    expect(builder.get("resize-stretch")).toStrictEqual({
      resizeMode: "stretch",
    });
    expect(builder.get("resize-repeat")).toStrictEqual({
      resizeMode: "repeat",
    });
    expect(builder.get("resize-center")).toStrictEqual({
      resizeMode: "center",
    });
  });

  test("Test Text static style", () => {
    expect(builder.get("italic")).toStrictEqual({
      fontStyle: "italic",
    });
    expect(builder.get("not-italic")).toStrictEqual({
      fontStyle: "normal",
    });

    const weights = [
      "font-thin",
      "font-extralight",
      "font-light",
      "font-normal",
      "font-medium",
      "font-semibold",
      "font-bold",
      "font-extrabold",
      "font-black",
    ];

    for (let i = 0; i < weights.length; i++) {
      const weight = weights[i];
      expect(builder.get(weight as any)).toStrictEqual({
        fontWeight: ((i + 1) * 100).toString(),
      });
    }

    expect(builder.get("uppercase")).toStrictEqual({
      textTransform: "uppercase",
    });
    expect(builder.get("lowercase")).toStrictEqual({
      textTransform: "lowercase",
    });
    expect(builder.get("capitalize")).toStrictEqual({
      textTransform: "capitalize",
    });
    expect(builder.get("normal-case")).toStrictEqual({
      textTransform: "none",
    });

    expect(builder.get("text-auto")).toStrictEqual({
      textAlign: "auto",
    });
    expect(builder.get("text-left")).toStrictEqual({
      textAlign: "left",
    });
    expect(builder.get("text-right")).toStrictEqual({
      textAlign: "right",
    });
    expect(builder.get("text-center")).toStrictEqual({
      textAlign: "center",
    });
    expect(builder.get("text-justify")).toStrictEqual({
      textAlign: "justify",
    });
  });
});
