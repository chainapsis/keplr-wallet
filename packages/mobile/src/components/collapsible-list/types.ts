import React from 'react';

export interface CollapsibleListProps {
  title: React.ReactNode;
  items: React.ReactNode[];

  hideLength?: boolean;
  lenAlwaysShown?: number;
}
