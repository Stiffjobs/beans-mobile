import { StyleSheet, TextProps } from 'react-native';
import type { PathProps, SvgProps } from 'react-native-svg';
import { Defs, LinearGradient, Stop } from 'react-native-svg';
import { nanoid } from 'nanoid/non-secure';

export type Props = {
	fill?: PathProps['fill'];
	style?: TextProps['style'];
	size?: keyof typeof sizes;
	gradient?: 'primary' | 'secondary';
} & Omit<SvgProps, 'style' | 'size'>;

export const sizes = {
	xs: 12,
	sm: 16,
	md: 20,
	lg: 24,
	xl: 28,
	'2xl': 32,
};

export function useCommonSVGProps(props: Props) {
	const { fill, size, gradient = 'primary', ...rest } = props;
	const style = StyleSheet.flatten(rest.style);
	const _size = Number(size ? sizes[size] : rest.width || sizes.md);
	let _fill = fill || style?.color || 'rgb(59 130 246)';

	let gradientDef = null;
	const id = gradient + '_' + nanoid();
	const gradientConfigs = {
		primary: {
			values: [
				['0%', 'rgb(64 64 64)'], // lighter black
				['100%', 'rgb(23 23 23)'], // darker black
			],
		},
		secondary: {
			values: [
				['0%', 'rgb(59 130 246)'], // lighter blue
				['100%', 'rgb(37 99 235)'], // darker blue
			],
		},
	};

	const config = gradientConfigs[gradient];
	_fill = `url(#${id})`;
	gradientDef = (
		<Defs>
			<LinearGradient
				id={id}
				x1="0"
				y1="0"
				x2="100%"
				y2="0"
				gradientTransform="rotate(45)"
			>
				{config.values.map(([stop, fill]) => (
					<Stop key={stop} offset={stop} stopColor={fill} />
				))}
			</LinearGradient>
		</Defs>
	);

	return {
		fill: _fill,
		size: _size,
		style,
		gradient: gradientDef,
		...rest,
	};
}

export function getIconSize(size: keyof typeof sizes) {
	return Number(size ? sizes[size] : sizes.md);
}
