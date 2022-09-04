import * as React from 'react'
import { ViewProps, StyleSheet, View } from 'react-native'

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  }
})

export const Row = (
  props: ViewProps & { children?: React.ReactNode; fullWidth?: boolean }
) => (
  <View
    {...props}
    style={[
      styles.row,
      props.style,
      props.fullWidth && {
        width: '100%',
        justifyContent: 'space-between',
        padding: 10,
        paddingHorizontal: 50
      }
    ]}
  />
)
