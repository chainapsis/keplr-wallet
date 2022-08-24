import { TouchableOpacity } from '@gorhom/bottom-sheet/src';
import { BlurView } from '@react-native-community/blur';
import React from 'react'

interface BottomSheetBackdropProps {
    onPressed: () => void,
    style: Object,
    visible: boolean
}

export function BottomSheetBackdrop({ style, onPressed, visible }: BottomSheetBackdropProps) {
    console.log({ visible, onPressed })
    // if (visible === false) { return null }
    // console.log({ rest })

    // const containerAnimatedStyle = useAnimatedStyle(() => ({
    //     opacity: interpolate(
    //         animatedIndex.value,
    //         [0, 1],
    //         [0, 1],
    //         Extrapolate.CLAMP
    //     ),
    // }));


    // const containerStyle = useMemo(
    //     () => [
    //         style,

    //         containerAnimatedStyle,
    //     ],
    //     [style, containerAnimatedStyle]
    // )


    return <TouchableOpacity
        style={style}
        onPress={() => { onPressed() }}
    >
        <BlurView
            style={{ flex: 1 }}
            blurAmount={0}

        />
    </TouchableOpacity>

}

