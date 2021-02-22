import React from "react";

import Popper, { PopperOptions } from "popper.js";
import classNames from "classnames";

import style from "./tooltip.module.scss";

export interface ToolTipProps {
  tooltip: React.ReactNode;
  theme: "dark" | "bright";
  options?: PopperOptions;
  trigger: "hover" | "click" | "static"; // If trigger is staic, visibilitiy is handled by show props.
  show?: boolean;
}

interface ToolTipState {
  show: boolean;
}

export class ToolTip extends React.Component<ToolTipProps, ToolTipState> {
  static defaultProps = {
    theme: "dark",
  };

  state = {
    show: false,
  };

  private ref = React.createRef<HTMLDivElement>();
  private popper: Popper | null = null;
  private tooltipRef = React.createRef<HTMLDivElement>();
  private componentRef = React.createRef<HTMLDivElement>();

  private hover = false;
  private bodyClicked = false;

  componentDidMount(): void {
    const tooltip = this.tooltipRef.current;
    const component = this.componentRef.current;

    if (tooltip && component) {
      let { options } = this.props;
      if (!options) {
        options = {};
      }
      if (!options.modifiers) {
        options.modifiers = {};
        options.modifiers.arrow = {
          enabled: true,
        };
      }

      this.popper = new Popper(component, tooltip, options);
    }

    document.addEventListener("click", this.handleClickOutside);
  }

  handleClickOutside = (e: any) => {
    if (
      this.props.trigger === "click" &&
      this.state.show &&
      this.ref &&
      this.ref.current &&
      !this.ref.current.contains(e.target)
    ) {
      this.setState({ show: false });
    }
  };

  componentDidUpdate(): void {
    if (this.popper) {
      this.popper.update();
    }
  }

  componentWillUnmount(): void {
    if (this.popper) {
      this.popper.destroy();
    }

    document.removeEventListener("click", this.handleClickOutside);
  }

  render() {
    const { theme, tooltip, trigger, children } = this.props;

    const show =
      this.props.trigger === "static" ? this.props.show : this.state.show;

    return (
      <div
        ref={this.ref}
        className={classNames({
          [style.bright]: theme === "bright",
          show: show,
        })}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
        onClick={this.onClick}
      >
        {/* Screen click capture for click trigger */}
        {trigger === "click" && show && (
          <div
            style={{
              position: "fixed",
              width: "100%",
              height: "100%",
              top: 0,
              left: 0,
            }}
          />
        )}
        {/* Parent div of tooltip */}
        <div
          ref={this.tooltipRef}
          className="popper"
          style={{
            visibility: show ? "visible" : "hidden",
            opacity: show ? 1 : 0,
          }}
        >
          <div x-arrow="" />
          {tooltip}
        </div>
        <div ref={this.componentRef}>{children}</div>
      </div>
    );
  }

  // This doesn't work if trigger is static
  public toggle = () => {
    this.setState({
      show: !this.state.show,
    });
  };

  onClick = () => {
    if (this.props.trigger !== "click") return;

    this.setState({
      show: !this.state.show,
    });

    if (this.bodyClicked) {
      this.bodyClicked = false;
    }
  };

  onMouseEnter = () => {
    if (this.props.trigger !== "hover") return;

    this.hover = true;
    this.setState({
      show: true,
    });
  };

  onMouseLeave = () => {
    if (this.props.trigger !== "hover") return;

    this.hover = false;
    // Delay to check mouse is hovering in order to keep tooltip a little bit further.
    setTimeout(() => {
      if (!this.hover) {
        this.setState({
          show: false,
        });
      }
    }, 150);
  };
}
