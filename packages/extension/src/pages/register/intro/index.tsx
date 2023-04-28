import React, { FunctionComponent, useEffect } from "react";
import { RegisterSceneBox } from "../components/register-scene-box";
import { Stack } from "../../../components/stack";
import { Button } from "../../../components/button";
import {
  useSceneEvents,
  useSceneTransition,
} from "../../../components/transition";
import { useRegisterHeader } from "../components/header";
import AnimIntro1 from "../../../public/assets/lottie/register/intro1.json";
import AnimIntro2 from "../../../public/assets/lottie/register/intro2.json";
import AnimIntro3 from "../../../public/assets/lottie/register/intro3.json";
import AnimIntro4 from "../../../public/assets/lottie/register/intro4.json";
import AnimIntro5 from "../../../public/assets/lottie/register/intro5.json";
import AnimIntro6 from "../../../public/assets/lottie/register/intro6.json";
import { YAxis } from "../../../components/axis";
import { Gutter } from "../../../components/gutter";
import lottie from "lottie-web";
import { TextButton } from "../../../components/button-text";

const AnimIntros = [
  AnimIntro1,
  AnimIntro2,
  AnimIntro3,
  AnimIntro4,
  AnimIntro5,
  AnimIntro6,
];

export const RegisterIntroScene: FunctionComponent = () => {
  const sceneTransition = useSceneTransition();

  const header = useRegisterHeader();
  useSceneEvents({
    onWillVisible: () => {
      header.setHeader({
        mode: "intro",
      });
    },
  });

  const animContainerRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let unmounted = false;

    if (animContainerRef.current) {
      const container = animContainerRef.current;

      let i = 0;
      (async () => {
        while (!unmounted) {
          const anim = lottie.loadAnimation({
            container: container,
            renderer: "svg",
            loop: false,
            autoplay: false,
            animationData: AnimIntros[i],
          });

          anim.play();
          anim.setSpeed(2);

          let resolver: () => void;

          anim.addEventListener("complete", () => {
            resolver();
          });

          await new Promise<void>((resolve) => {
            resolver = resolve;
          });

          anim.destroy();

          i = (i + 1) % AnimIntros.length;
        }
      })();
    }

    return () => {
      unmounted = true;
    };
  }, []);

  return (
    <RegisterSceneBox>
      <YAxis alignX="center">
        <div
          ref={animContainerRef}
          style={{
            width: "12.5rem",
            height: "12.5rem",
          }}
        />
      </YAxis>
      <Gutter size="3.125rem" />
      <Stack gutter="1.25rem">
        <Button
          text="Create a new wallet"
          size="large"
          onClick={() => {
            sceneTransition.push("new-user");
          }}
        />
        <Button
          text="Import an existing wallet"
          size="large"
          color="secondary"
          onClick={() => {
            sceneTransition.push("existing-user");
          }}
        />
        <TextButton
          text="Connect Hardware Wallet"
          size="large"
          onClick={() => {
            sceneTransition.push("connect-hardware-wallet");
          }}
        />
      </Stack>
    </RegisterSceneBox>
  );
};
