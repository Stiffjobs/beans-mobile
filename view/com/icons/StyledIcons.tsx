import { icons } from 'lucide-react-native';
import { cssInterop } from 'nativewind';
import { memo, useMemo } from 'react';

export type IconName = keyof typeof icons;
export type IconProps = { name: IconName; className?: string };

const StyledIcon: React.FC<IconProps> = memo(({ name, className }) => {
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

	return <CustomIcon className={className} />;
});

export { StyledIcon };
