import React, {forwardRef} from 'react';
import {SearchIcon} from '../../icon';
import {TextInput} from '../index';
import {TextInput as NativeTextInput} from 'react-native';

//TODO textInput을 수정해서 icon color도 수정 할 수있게 변경해야함
// 아래 코드를 참조 해서 수정
// (() => {
//   if (props.value && typeof props.value === 'string') {
//     return props.value.trim().length > 0
//       ? style.get('color-gray-200').color
//       : style.get('color-gray-200').color;
//   }
// })()

const LeftIcon = (color: string) => <SearchIcon color={color} size={20} />;

export const SearchTextInput = forwardRef<
  NativeTextInput,
  Omit<React.ComponentProps<typeof TextInput>, 'left'>
>((props, ref) => {
  return <TextInput {...props} ref={ref} left={LeftIcon} />;
});
