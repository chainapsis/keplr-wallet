import React from "react";
import {
  SceneEvents,
  SceneEventsContext,
  SceneTransitionContext,
} from "./types";

export const SceneTransitionContextBase =
  React.createContext<SceneTransitionContext | null>(null);

export const SceneEventsContextBase =
  React.createContext<SceneEventsContext | null>(null);

export const useSceneEvents = (events: SceneEvents) => {
  const store = React.useContext(SceneEventsContextBase);
  if (!store) {
    throw new Error("You have forgot to use SceneEventsProvider");
  }
  // Events should be ref
  store.setEvents(events);
};
