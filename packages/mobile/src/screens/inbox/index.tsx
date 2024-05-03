import React, { useRef, useState } from "react";
import { PageWithScrollViewInBottomTabView } from "components/page";
import { ScrollView, Text, View, ViewStyle } from "react-native";
import { useStyle } from "styles/index";
import { TabBarView } from "components/new/tab-bar/tab-bar";
import { ChatSection } from "screens/inbox/chat-section";
import { AgentsSection } from "screens/inbox/agents-section";
import { NotificationSection } from "screens/inbox/notification-section";

enum InboxEnum {
  Notification = "Notifications",
  Chat = "Chat",
  Agents = "Agents",
}

export const InboxScreen = () => {
  const scrollViewRef = useRef<ScrollView | null>(null);
  const style = useStyle();
  const [selectedId, setSelectedId] = useState(InboxEnum.Notification);

  return (
    <PageWithScrollViewInBottomTabView
      backgroundMode={"image"}
      contentContainerStyle={style.get("flex-grow-1")}
      style={style.flatten(["padding-x-page", "overflow-scroll"]) as ViewStyle}
      ref={scrollViewRef}
    >
      <Text
        style={
          style.flatten([
            "h1",
            "color-white",
            "margin-y-10",
            "font-normal",
          ]) as ViewStyle
        }
      >
        Inbox
      </Text>
      <TabBarView
        listItem={InboxEnum}
        selected={selectedId}
        setSelected={setSelectedId}
      />
      <View style={style.flatten(["flex-1", "justify-center"]) as ViewStyle}>
        {selectedId === InboxEnum.Notification && <NotificationSection />}
        {selectedId === InboxEnum.Chat && <ChatSection />}
        {selectedId === InboxEnum.Agents && <AgentsSection />}
      </View>
    </PageWithScrollViewInBottomTabView>
  );
};
