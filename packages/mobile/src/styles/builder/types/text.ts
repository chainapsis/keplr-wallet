import {FontWeightNumbers} from '../uilts';
import {
  EnumFontStyle,
  EnumTextAlign,
  EnumTextTransform,
  StaticStylesDefinitions,
} from './common';
export const StaticTextStyles = {
  italic: {
    fontStyle: 'italic' as EnumFontStyle,
  },
  'not-italic': {
    fontStyle: 'normal' as EnumFontStyle,
  },
  'font-thin': {
    fontWeight: '100' as FontWeightNumbers,
    fontFamily: 'Inter-Thin',
  },
  'font-extralight': {
    fontWeight: '200' as FontWeightNumbers,
    fontFamily: 'Inter-SemiLight',
  },
  'font-light': {
    fontWeight: '300' as FontWeightNumbers,
    fontFamily: 'Inter-Light',
  },
  'font-normal': {
    fontWeight: '400' as FontWeightNumbers,
    fontFamily: 'Inter-Regular',
  },
  'font-medium': {
    fontWeight: '500' as FontWeightNumbers,
    fontFamily: 'Inter-Medium',
  },
  'font-semibold': {
    fontWeight: '600' as FontWeightNumbers,
    fontFamily: 'Inter-SemiBold',
  },
  'font-bold': {
    fontWeight: '700' as FontWeightNumbers,
    fontFamily: 'Inter-Bold',
  },
  'font-extrabold': {
    fontWeight: '800' as FontWeightNumbers,
    fontFamily: 'Inter-ExtraBold',
  },
  'font-black': {
    fontWeight: '900' as FontWeightNumbers,
    fontFamily: 'Inter-Black',
  },
  uppercase: {
    textTransform: 'uppercase' as EnumTextTransform,
  },
  lowercase: {
    textTransform: 'lowercase' as EnumTextTransform,
  },
  capitalize: {
    textTransform: 'capitalize' as EnumTextTransform,
  },
  'normal-case': {
    textTransform: 'none' as EnumTextTransform,
  },
  'text-auto': {
    textAlign: 'auto' as EnumTextAlign,
  },
  'text-left': {
    textAlign: 'left' as EnumTextAlign,
  },
  'text-right': {
    textAlign: 'right' as EnumTextAlign,
  },
  'text-center': {
    textAlign: 'center' as EnumTextAlign,
  },
  'text-justify': {
    textAlign: 'justify' as EnumTextAlign,
  },
};

export type StyleBuilderTextDefinitions = StaticStylesDefinitions<
  typeof StaticTextStyles
>;
