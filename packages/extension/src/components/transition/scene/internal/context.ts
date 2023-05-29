import React from "react";
import {
  FixedWidthSceneContext,
  SceneEvents,
  SceneEventsContext,
  SceneTransitionContext,
} from "./types";

export const SceneTransitionContextBase =
  React.createContext<SceneTransitionContext | null>(null);

export const SceneEventsContextBase =
  React.createContext<SceneEventsContext | null>(null);

export const useSceneEvents = (events: SceneEvents) => {
  const context = React.useContext(SceneEventsContextBase);
  if (!context) {
    throw new Error("You have forgot to use SceneEventsProvider");
  }
  // Events should be ref
  context.setEvents(events);
};

export const FixedWidthSceneContextBase =
  React.createContext<FixedWidthSceneContext | null>(null);

export const useFixedWidthScene = () => {
  const context = React.useContext(FixedWidthSceneContextBase);
  if (!context) {
    throw new Error("You have forgot to use FixedWidthSceneProvider");
  }
  return context;
};
