import React from 'react';
import {TextStyle, ViewStyle} from 'react-native';

export interface TextInputProps {
  label?: string;
  rightLabel?: React.ReactNode;
  style?: TextStyle;
  paragraph?: string;
  error?: string;
  errorBorder?: boolean;
  isLoading?: boolean;

  className?: string;

  disabled?: boolean;
  left?: React.ReactNode | ((color: string) => React.ReactNode);
  right?: React.ReactNode | ((color: string) => React.ReactNode);
  bottom?: React.ReactNode;

  containerStyle?: ViewStyle;
}
