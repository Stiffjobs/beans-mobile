import { Label } from './ui/label';
import { Text } from './ui/text';

export function RequiredLabel({ children }: { children: React.ReactNode }) {
	return (
		<Label>
			{children} <Text className="text-destructive">*</Text>
		</Label>
	);
}
