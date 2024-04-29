import React from 'react';

export interface CollapsibleListProps {
  title: React.ReactNode;
  items: React.ReactNode[];
  itemKind: 'tokens' | 'validators';
  hideLength?: boolean;
  lenAlwaysShown?: number;
}
