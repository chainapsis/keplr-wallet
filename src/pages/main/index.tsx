import React from "react";

import { Button } from "../../components/button";

class MainPage extends React.Component {
  public render() {
    return (
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Button size="xsmall" style={{ margin: "4px" }}>
          Hello, popup!
        </Button>
        <Button size="small" style={{ margin: "4px" }}>
          Hello, popup!
        </Button>
        <Button size="default" style={{ margin: "4px" }}>
          Hello, popup!
        </Button>
        <Button size="large" style={{ margin: "4px" }}>
          Hello, popup!
        </Button>
        <Button size="xlarge" style={{ margin: "4px" }}>
          Hello, popup!
        </Button>
        <Button size="default" disabled style={{ margin: "4px" }}>
          Disabled
        </Button>
        <Button color="primary" style={{ margin: "4px" }}>
          Hello, popup!
        </Button>
        <Button color="secondary" style={{ margin: "4px" }}>
          Hello, popup!
        </Button>
        <Button color="link" style={{ margin: "4px" }}>
          Hello, popup!
        </Button>
        <Button color="success" style={{ margin: "4px" }}>
          Hello, popup!
        </Button>
        <Button color="warning" style={{ margin: "4px" }}>
          Hello, popup!
        </Button>
        <Button color="error" style={{ margin: "4px" }}>
          Hello, popup!
        </Button>
      </div>
    );
  }
}

export default MainPage;
