import React from 'react';
import { View, TouchableOpacity, FlatList } from 'react-native';
import { Text } from '~/components/ui/text';
import { Id } from '~/convex/_generated/dataModel';
import { Separator } from '../ui/separator';
import { UserAvatar } from '~/view/com/util/UserAvatar';
import { useFetchFollowers } from '~/state/queries/post';

type User = {
	_id: Id<'users'>;
	name: string;
	avatar: string | null;
};

type MentionSuggestionsProps = {
	searchText: string;
	onSelectUser: (user: User | null) => void;
};

export function MentionSuggestions({
	searchText,
	onSelectUser,
}: MentionSuggestionsProps) {
	const followers = useFetchFollowers();

	if (!followers.data) return null;

	let filteredUsers = followers.data;
	if (searchText.length > 1) {
		const target = searchText.slice(1);
		filteredUsers = followers.data
			.filter((user: User | null): user is User => user !== null)
			.filter((user: User) =>
				user.name.toLowerCase().includes(target.toLowerCase())
			);
	}

	if (!filteredUsers.length) return null;
	return (
		<View className="mb-2 bg-background border border-border rounded-lg max-h-40 z-50">
			<FlatList
				data={filteredUsers}
				//INFO: this is to prevent the keyboard from closing when the user selects a user
				keyboardShouldPersistTaps="always"
				ItemSeparatorComponent={() => <Separator />}
				renderItem={({ item }) => (
					<TouchableOpacity
						key={item?._id}
						onPress={() => onSelectUser(item)}
						className="flex-row items-center p-3 border-border"
					>
						<View className="h-8 w-8 rounded-full bg-muted overflow-hidden mr-2">
							<UserAvatar avatar={item?.avatar} size="sm" />
						</View>
						<Text className="flex-1">{item?.name}</Text>
					</TouchableOpacity>
				)}
			/>
		</View>
	);
}
