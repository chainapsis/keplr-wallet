import { Dimensions, Platform } from 'react-native'

const { height } = Dimensions.get('window')

// Remove the status bar height
// since the modal view does not cover this area
const ANDROID_MINUS_HEIGHT = 24

const DEFAULT_HEIGHT =
  Platform.OS === 'android' ? height - ANDROID_MINUS_HEIGHT : height

export const getHeightPercent = (percentage: number) =>
  Math.round(DEFAULT_HEIGHT * (percentage / 100))
