import React, {forwardRef, useEffect, useState} from 'react';
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

export const DebounceSearchTextInput = forwardRef<
  NativeTextInput,
  Pick<React.ComponentProps<typeof TextInput>, 'ref' | 'placeholder'> & {
    handleSearchWord: (debouncedText: string) => void;
    delay: number;
  }
>((props, ref) => {
  const [searchWord, setSearchWord] = useState<string>('');
  const {delay, handleSearchWord} = props;
  const debouncedSearchWord = useDebounce(searchWord, delay);

  useEffect(() => {
    handleSearchWord(debouncedSearchWord);
  }, [debouncedSearchWord, handleSearchWord]);

  return (
    <TextInput
      autoCapitalize="none"
      value={searchWord}
      onChangeText={e => setSearchWord(e)}
      {...props}
      ref={ref}
      left={LeftIcon}
    />
  );
});

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}
