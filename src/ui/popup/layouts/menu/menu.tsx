import React, {
  FunctionComponent,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";

import { AnimatePresence, motion } from "framer-motion";

import style from "./menu.module.scss";

export interface MenuContext {
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const menuContext = React.createContext<MenuContext | null>(null);

export const MenuProvider = menuContext.Provider;

export const useMenu = (): MenuContext => {
  const context = useContext(menuContext);
  if (!context) {
    throw new Error("You have forgot to use MenuProvider");
  }
  return context;
};

const sidebar = {
  open: (height = 1000) => ({
    clipPath: `circle(${height + 100}px at 40px 40px)`,
    transition: {
      type: "tween",
      ease: "easeOut",
      duration: 0.3
    }
  }),
  closed: {
    clipPath: "circle(0px at 40px 40px)",
    transition: {
      type: "tween",
      duration: 0.15
    }
  }
};

const background = {
  open: {
    opacity: 0.3,
    transition: {
      type: "tween",
      ease: "easeOut",
      duration: 0.3
    }
  },
  closed: {
    opacity: 0,
    transition: {
      type: "tween",
      ease: "easeOut",
      duration: 0.15
    }
  }
};

export interface Props {
  isOpen: boolean;
}

export const Menu: FunctionComponent<Props> = ({ isOpen, children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [animHeight, setAnimHeight] = useState(0);

  const menu = useMenu();

  useEffect(() => {
    if (containerRef && containerRef.current) {
      setAnimHeight(containerRef.current.offsetHeight);
    }
  }, []);

  return (
    <>
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            className={style.background}
            animate={isOpen ? "open" : "closed"}
            variants={background}
            exit="closed"
            initial={{ opacity: 0 }}
            onClick={() => {
              menu.close();
            }}
          />
        ) : null}
      </AnimatePresence>
      <motion.nav
        className={style.menuNav}
        animate={isOpen ? "open" : "closed"}
        custom={animHeight}
        ref={containerRef}
        variants={sidebar}
      >
        {children}
      </motion.nav>
    </>
  );
};
