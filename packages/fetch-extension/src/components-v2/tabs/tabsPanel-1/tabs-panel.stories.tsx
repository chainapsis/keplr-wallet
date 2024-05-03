import React from "react";
import { TabsPanel, TabsProps } from "./index";
import { Card } from "../../card";
import { Story } from "@storybook/react";

export default {
  title: "Components/TabsPanel",
  component: TabsPanel,
};

const Template: Story<TabsProps> = (args: TabsProps) => <TabsPanel {...args} />;

const tabs = [
  {
    id: "fetchub",
    component: (
      <div>
        <Card
          isActive={true}
          heading={"Fetch.ai"}
          subheading={"1200 FET"}
          rightContent={"$1200"}
        />
      </div>
    ),
  },
  { id: "Dorado", component: <div>Content for Tab 2</div>, disabled: true },
  {
    id: "Ethereum",
    component: (
      <div>
        <Card
          heading={"Fetch.ai"}
          subheading={"1200 ETH"}
          rightContent={"$11200"}
        />
      </div>
    ),
  },
];

export const Default = Template.bind({});
Default.args = {
  tabs: tabs,
};
