import { icons, View } from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import { memo, useEffect, useMemo } from 'react';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from 'react-native-reanimated';

export type IconName = keyof typeof icons;
export type IconProps = { name: IconName; className?: string; color?: string };
export type AnimatedProps = IconProps & { focused?: boolean };

const StyledIcon: React.FC<IconProps> = memo(({ name, className, color }) => {
	const CustomIcon = useMemo(() => {
		const Icon = icons[name];
		Icon.displayName = name;

		return cssInterop(Icon, {
			className: {
				target: 'style',
				nativeStyleToProp: {
					color: true,
					width: true,
					height: true,
				},
			},
		});
	}, [name]);

	return <CustomIcon color={color} className={className} />;
});

export const TabBarAnimatedIcon: React.FC<AnimatedProps> = ({
	name,
	className,
	color,
	focused,
}) => {
	const scale = useSharedValue(1);
	const animatedStyle = useAnimatedStyle(() => {
		return {
			transform: [{ scale: scale.value }],
		};
	});
	useEffect(() => {
		scale.value = withSpring(focused ? 1.05 : 1, {
			damping: 10,
			stiffness: 100,
		});
	}, [focused]);
	const CustomIcon = useMemo(() => {
		const Icon = icons[name];
		Icon.displayName = name;

		return Animated.createAnimatedComponent(
			cssInterop(Icon, {
				className: {
					target: 'style',
					nativeStyleToProp: {
						color: true,
						width: true,
						height: true,
					},
				},
			})
		);
	}, [name, focused]);
	return (
		<CustomIcon color={color} className={className} style={[animatedStyle]} />
	);
};

export { StyledIcon };
