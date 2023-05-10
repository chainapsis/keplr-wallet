import { useLayoutEffect, useState } from "react";

export const useLoadFonts = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useLayoutEffect(() => {
    const fonts: FontFace[] = [
      new FontFace(
        "Inter",
        `url(${require("./public/assets/font/Inter-Regular.ttf")})`,
        {
          weight: "400",
        }
      ),
      new FontFace(
        "Inter",
        `url(${require("./public/assets/font/Inter-Medium.ttf")})`,
        {
          weight: "500",
        }
      ),
      new FontFace(
        "Inter",
        `url(${require("./public/assets/font/Inter-SemiBold.ttf")})`,
        {
          weight: "600",
        }
      ),
      new FontFace(
        "Inter",
        `url(${require("./public/assets/font/Inter-Bold.ttf")})`,
        {
          weight: "700",
        }
      ),
    ];

    const len = fonts.length;

    let numLoaded = 0;
    for (const font of fonts) {
      font.load().then(() => {
        document.fonts.add(font);

        numLoaded++;
        if (numLoaded === len) {
          setIsLoaded(true);
        }
      });
    }
  }, []);

  return {
    isLoaded,
  };
};
