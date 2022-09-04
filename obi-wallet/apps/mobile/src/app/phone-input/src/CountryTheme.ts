import { createTheming } from '@callstack/react-theme-provider'
import { Platform } from 'react-native'
import { getHeightPercent } from './ratio'

export const DEFAULT_THEME = {
  primaryColor: '#ccc',
  primaryColorVariant: '#4B4E6E',
  backgroundColor: '#ffffff',
  onBackgroundTextColor: '#000000',
  fontSize: 14,
  fontFamily: Platform.select({
    ios: 'System',
    android: 'Roboto',
    web: 'Arial'
  }),
  filterPlaceholderTextColor: '#aaa',
  activeOpacity: 0.5,
  itemHeight: getHeightPercent(6),
  flagSize: Platform.select({ android: 20, default: 30 }),
  flagSizeButton: Platform.select({ android: 20, default: 30 })
}
export const DARK_THEME = {
  ...DEFAULT_THEME,
  primaryColor: '#000',
  primaryColorVariant: '#000',
  backgroundColor: '#090816',
  onBackgroundTextColor: '#F6F5FF',
  fontSize: 14,
  fontFamily: Platform.select({
    ios: 'System',
    android: 'Roboto',
    web: 'Arial'
  }),
  filterPlaceholderTextColor: '#4B4E6E',
  activeOpacity: 0.5,
  flagSize: Platform.select({ android: 20, default: 30 }),
  flagSizeButton: Platform.select({ android: 20, default: 30 })
  
}
export type Theme = Partial<typeof DEFAULT_THEME>

const { ThemeProvider, useTheme } = createTheming<Theme>(DEFAULT_THEME)

export { ThemeProvider, useTheme }
