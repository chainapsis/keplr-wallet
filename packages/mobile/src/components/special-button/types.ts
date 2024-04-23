import React from 'react';
import {ViewStyle} from 'react-native';

export interface SpecialButtonProps {
  size?: 'extra-small' | 'small' | 'medium' | 'large';
  left?: React.ReactNode;
  text?: string;
  right?: React.ReactNode;
  disabled?: boolean;
  onPress?: () => void;
  isLoading?: boolean;
  textOverrideIcon?: React.ReactNode;
  innerButtonStyle?: ViewStyle;
}
