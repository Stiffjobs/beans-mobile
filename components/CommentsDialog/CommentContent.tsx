import { Text } from '~/components/ui/text';
import { View } from 'react-native';

type CommentContentProps = {
	content: string;
};

export function CommentContent({ content }: CommentContentProps) {
	// Split the content by mentions (@username)
	const parts = content.split(/(@\w+)/g);

	return (
		<Text>
			{parts.map((part, index) => {
				if (part.startsWith('@')) {
					return (
						<Text key={index} className="font-bold">
							{part}
						</Text>
					);
				}
				return part;
			})}
		</Text>
	);
}
