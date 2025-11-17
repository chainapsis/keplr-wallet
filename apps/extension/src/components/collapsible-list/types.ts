import React from "react";

export interface CollapsibleListProps {
  title: React.ReactNode;
  items: React.ReactNode[];

  lenAlwaysShown?: number;

  // privacy mode를 위해서 대충 추가됨
  hideNumInTitle?: boolean;

  // stake page에서 사용하는 옵션
  // 숫자를 제거하고 제목만 보여준다.
  removeNumInTitle?: boolean;

  // 이걸 키면 리스트가 길때 성능이 조금 더 좋아진다.
  // 하지만 부작용으로 펼칠때는 트랜지션없이 즉각적으로 펼쳐진다.
  notRenderHiddenItems?: boolean;

  altViewMoreIntlTextId?: string;

  onCollapse?: (isCollapsed: boolean) => void;

  titleContainerStyle?: React.CSSProperties;
}
