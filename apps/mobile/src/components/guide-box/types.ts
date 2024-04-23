import React from 'react';
import {TextStyle} from 'react-native';

export type GuideBoxColor = 'default' | 'safe' | 'warning' | 'danger';

export interface GuideBoxProps {
  title: string;
  paragraph?: string | React.ReactNode;
  bottom?: React.ReactNode;
  titleRight?: React.ReactNode;
  color?: GuideBoxColor;

  titleStyle?: TextStyle;
  hideInformationIcon?: boolean;
  backgroundColor?: string;
}
