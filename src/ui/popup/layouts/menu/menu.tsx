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
  open: (option = { height: 1000, x: "0px", y: "0px" }) => ({
    clipPath: `circle(${option.height + 100}px at ${option.x} ${option.y})`,
    transition: {
      type: "tween",
      ease: "easeOut",
      duration: 0.3
    }
  }),
  closed: (option = { height: 1000, x: "0px", y: "0px" }) => ({
    clipPath: `circle(0px at ${option.x} ${option.y})`,
    transition: {
      type: "tween",
      duration: 0.15
    }
  })
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
  menuRef?: React.RefObject<unknown>;
}

export const Menu: FunctionComponent<Props> = ({
  isOpen,
  menuRef,
  children
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [animHeight, setAnimHeight] = useState(0);
  const [at, setAt] = useState<{ x: string; y: string } | null>(null);

  const menu = useMenu();

  useEffect(() => {
    if (containerRef && containerRef.current) {
      setAnimHeight(containerRef.current.offsetHeight);
    }
  }, []);

  const menuRefCurrent = menuRef ? menuRef.current : null;
  useEffect(() => {
    if (menuRef && menuRef.current) {
      const el = menuRef.current as HTMLElement;
      if (el) {
        const rect = el.getBoundingClientRect();

        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;

        setAt({ x: x + "px", y: y + "px" });
      }
    }
    if (menuRef === undefined) {
      setAt({ x: "0px", y: "0px" });
    }
  }, [menuRef, menuRefCurrent]);

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
        ref={containerRef}
        style={{ clipPath: `circle(0px at 0% 0%})` }}
        custom={at ? { height: animHeight, x: at.x, y: at.y } : undefined}
        animate={at ? (isOpen ? "open" : "closed") : undefined}
        variants={at ? sidebar : undefined}
      >
        {children}
      </motion.nav>
    </>
  );
};
