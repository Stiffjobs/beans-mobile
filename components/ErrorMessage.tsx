import { Text } from 'react-native';
export function ErrorMessage({ message }: { message?: string }) {
	if (!message) return null;
	return <Text className="text-red-600 font-semibold">{message}</Text>;
}
