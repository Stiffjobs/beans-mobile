import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../ui/select';

export function SelectComponent(props: {
	onChange: (...event: any[]) => void;
	value?: string;
	portalHost?: string;
	placeholder?: string;
	label?: string;
	options: { label: string; value: string }[];
}) {
	const insets = useSafeAreaInsets();
	const contentInsets = {
		top: insets.top,
		bottom: insets.bottom,
		left: 12,
		right: 12,
	};
	const { onChange, value, placeholder, portalHost, options } = props;
	const label = options.find(e => e.value === value)?.label;
	return (
		<Select onValueChange={onChange}>
			<SelectTrigger className="w-[250px]">
				<SelectValue
					className="text-foreground text-sm native:text-lg"
					placeholder={label ?? placeholder ?? ''}
				/>
			</SelectTrigger>
			<SelectContent
				portalHost={portalHost}
				insets={contentInsets}
				className="w-[250px]"
			>
				<SelectGroup>
					{options.map(option => (
						<SelectItem
							key={option.value}
							label={option.label}
							value={option.value}
						>
							{option.label}
						</SelectItem>
					))}
				</SelectGroup>
			</SelectContent>
		</Select>
	);
}
