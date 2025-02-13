import React from 'react';
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withTiming,
} from 'react-native-reanimated';
import { Loader_Stroke2_Corner0_Rounded as Icon } from './icons/LoaderIcon';
import { cn } from '~/lib/utils';
import { Props, useCommonSVGProps } from './icons/common';
import { View } from 'react-native';

export function Loader({
	centered = true,
	...props
}: Props & { centered?: boolean }) {
	const common = useCommonSVGProps(props);
	const rotation = useSharedValue(0);

	const animatedStyles = useAnimatedStyle(() => ({
		transform: [{ rotate: rotation.get() + 'deg' }],
	}));

	React.useEffect(() => {
		rotation.set(() =>
			withRepeat(withTiming(360, { duration: 1000, easing: Easing.linear }), -1)
		);
	}, [rotation]);
	if (!centered) {
		return (
			<Animated.View
				className="relative justify-center items-center"
				style={[{ width: common.size, height: common.size }, animatedStyles]}
			>
				<Icon
					{...props}
					className={cn('absolute inset-0 text-contrast-high', props.className)}
				/>
			</Animated.View>
		);
	}

	return (
		<View className="flex-1 justify-center items-center">
			<Animated.View
				className="relative justify-center items-center"
				style={[{ width: common.size, height: common.size }, animatedStyles]}
			>
				<Icon
					{...props}
					className={cn('absolute inset-0 text-contrast-high', props.className)}
				/>
			</Animated.View>
		</View>
	);
}
