import MaskInput from 'react-native-mask-input';
import { timeMaskInputClassName, timeMaskRegex } from '~/lib/utils';

export const TimeMaskInput = ({
	value,
	onChange,
}: {
	value: string;
	onChange: (...event: any[]) => void;
}) => {
	return (
		<MaskInput
			mask={timeMaskRegex}
			className={timeMaskInputClassName}
			value={value}
			placeholder="MM:SS"
			onChangeText={onChange}
			keyboardType="numeric"
		/>
	);
};
