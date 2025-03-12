import Svg, { Circle, Path, CircleProps, PathProps } from 'react-native-svg';
import { cssInterop } from 'nativewind';

export const SvgNativeWind = cssInterop(Svg, {
	className: {
		target: 'style',
		nativeStyleToProp: { width: true, height: true },
	},
});

export const CircleNativeWind = cssInterop(Circle, {
	className: {
		target: 'style' as keyof CircleProps,
		nativeStyleToProp: {
			fill: true,
		},
	},
});

export const PathNativeWind = cssInterop(Path, {
	className: {
		target: 'style' as keyof PathProps,
		nativeStyleToProp: {
			fill: true,
		},
	},
});
