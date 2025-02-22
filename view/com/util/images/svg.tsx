import Svg, {
	Circle,
	Rect,
	Path,
	SvgProps,
	CircleProps,
	RectProps,
	PathProps,
} from 'react-native-svg';
import { cssInterop } from 'nativewind';
import { useMemo } from 'react';

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
			fill: 'fill' as keyof CircleProps,
		},
	},
});

export const PathNativeWind = cssInterop(Path, {
	className: {
		target: 'style' as keyof PathProps,
		nativeStyleToProp: { fill: 'fill' as keyof PathProps },
	},
});
