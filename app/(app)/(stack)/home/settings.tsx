import { View, Pressable, ActivityIndicator } from 'react-native';
import { Text } from '~/components/ui/text';
import { ChevronRight } from 'lucide-react-native';
import { useSignOut } from '~/state/queries/auth';
import { Loader } from '~/components/Loader';

export default () => {
	const useSignOutMutation = useSignOut();
	const handleSignOut = async () => {
		await useSignOutMutation.mutateAsync();
	};
	return (
		<View className="flex-1 bg-gray-100">
			<View className="gap-4 mt-4">
				{/* Account Section */}
				<View className="bg-white">
					<Pressable className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
						<Text className="text-base">Account Settings</Text>
						<ChevronRight size={20} className="text-gray-400" />
					</Pressable>
					<Pressable className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
						<Text className="text-base">Notifications</Text>
						<ChevronRight size={20} className="text-gray-400" />
					</Pressable>
					<Pressable className="flex-row items-center justify-between px-4 py-3">
						<Text className="text-base">Privacy</Text>
						<ChevronRight size={20} className="text-gray-400" />
					</Pressable>
				</View>

				{/* Preferences Section */}
				<View className=" bg-white">
					<Pressable className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
						<Text className="text-base">Appearance</Text>
						<ChevronRight size={20} className="text-gray-400" />
					</Pressable>
					<Pressable className="flex-row items-center justify-between px-4 py-3">
						<Text className="text-base">Language</Text>
						<ChevronRight size={20} className="text-gray-400" />
					</Pressable>
				</View>

				{/* Support Section */}
				<View className=" bg-white">
					<Pressable className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
						<Text className="text-base">Help & Support</Text>
						<ChevronRight size={20} className="text-gray-400" />
					</Pressable>
					<Pressable
						onPress={handleSignOut}
						className="flex-row items-center justify-between px-4 py-3"
					>
						<>
							{useSignOutMutation.isPending ? (
								<Loader />
							) : (
								<Text className="text-base text-red-500">Sign Out</Text>
							)}
						</>
						<ChevronRight size={20} className="text-gray-400" />
					</Pressable>
				</View>
			</View>
		</View>
	);
};
