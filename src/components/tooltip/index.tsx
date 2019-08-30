import React from "react";

import Popper, { PopperOptions } from "popper.js";
import classNames from "classnames";

import style from "./tooltip.scss";

export interface ToolTipProps {
  tooltip: React.ReactNode;
  theme: "dark" | "bright";
  options?: PopperOptions;
}

interface ToolTipState {
  show: boolean;
}

export class ToolTip extends React.Component<ToolTipProps, ToolTipState> {
  static defaultProps = {
    theme: "dark"
  };

  state = {
    show: false
  };

  private popper: Popper | null = null;
  private tooltipRef = React.createRef<HTMLDivElement>();
  private componentRef = React.createRef<HTMLDivElement>();

  private hover = false;

  // TODO: When props related to popper are changed, reinitialize popper.
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
          enabled: true
        };
      }

      this.popper = new Popper(component, tooltip, options);
    }
  }

  componentWillUnmount(): void {
    if (this.popper) {
      this.popper.destroy();
    }
  }

  render() {
    const { theme, tooltip, children } = this.props;

    return (
      <div
        className={classNames({ [style.bright]: theme === "bright" })}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
      >
        {/* Parent div of tooltip */}
        <div
          ref={this.tooltipRef}
          className="popper"
          style={{ visibility: this.state.show ? "visible" : "hidden" }}
        >
          <div x-arrow="" />
          {tooltip}
        </div>
        <div ref={this.componentRef}>{children}</div>
      </div>
    );
  }

  onMouseEnter = () => {
    this.hover = true;
    this.setState({
      show: true
    });
  };

  onMouseLeave = () => {
    this.hover = false;
    // Delay to check mouse is hovering in order to keep tooltip a little bit further.
    setTimeout(() => {
      if (!this.hover) {
        this.setState({
          show: false
        });
      }
    }, 150);
  };
}
