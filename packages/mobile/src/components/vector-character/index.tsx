import React, { FunctionComponent } from "react";

import * as Characters from "./characters";

const CharacterComponents: {
  [charactor: string]:
    | FunctionComponent<{ color: string; height: number }>
    | undefined;
} = {
  A: Characters.VectorA,
  B: Characters.VectorB,
  C: Characters.VectorC,
  D: Characters.VectorD,
  E: Characters.VectorE,
  F: Characters.VectorF,
  G: Characters.VectorG,
  H: Characters.VectorH,
  I: Characters.VectorI,
  J: Characters.VectorG,
  K: Characters.VectorK,
  L: Characters.VectorL,
  M: Characters.VectorM,
  N: Characters.VectorN,
  O: Characters.VectorO,
  P: Characters.VectorP,
  Q: Characters.VectorQ,
  R: Characters.VectorR,
  S: Characters.VectorS,
  T: Characters.VectorT,
  U: Characters.VectorU,
  V: Characters.VectorV,
  W: Characters.VectorW,
  X: Characters.VectorX,
  Y: Characters.VectorY,
  Z: Characters.VectorZ,
};

export const VectorCharacter: FunctionComponent<{
  char: string;
  color: string;
  height: number;
}> = ({ char, color, height }) => {
  char = char.toUpperCase();

  const Component = (() => {
    const vector = CharacterComponents[char[0]];
    if (vector) {
      return vector;
    }

    return Characters.VectorQuestionMark;
  })();

  return <Component color={color} height={height} />;
};
