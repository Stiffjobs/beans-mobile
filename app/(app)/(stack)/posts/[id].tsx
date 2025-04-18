import { Link, Stack, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { View, ScrollView, FlatList, Pressable, Alert } from 'react-native';
import { Loader } from '~/components/Loader';
import {
	useGetPostById,
	useLikePost,
	useMarkNotificationsAsRead,
	useUnlikePost,
} from '~/state/queries/post';
import { Image } from 'expo-image';
import { Text } from '~/components/ui/text';
import { useCallback, useEffect, useState } from 'react';
import ImageView from 'react-native-image-viewing';
import { Button } from '~/components/ui/button';
import {
	DetailsDialog,
	useDetailsDialogControl,
} from '~/components/DetailsDialog';
import { useModalControls } from '~/state/modals';
import { useGetCurrentUser } from '~/state/queries/auth';
import { H4 } from '~/components/ui/typography';
import { Ellipsis } from '~/lib/icons/Ellipsis';
import { UserAvatar } from '~/view/com/util/UserAvatar';
import {
	useFollowUser,
	useIsFollowingThisUser,
	useUnfollowUser,
} from '~/state/queries/users';
import { Id } from '~/convex/_generated/dataModel';
import { t } from '@lingui/core/macro';
import { useQuery } from 'convex/react';
import { api } from '~/convex/_generated/api';
import { useFetchPostComments } from '~/state/queries/post_comments';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Share } from 'lucide-react-native';

// Share recipe as plain text

export default function PostDetailsPage() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const [viewImageIndex, setViewImageIndex] = useState(0);
	const [visible, setVisible] = useState(false);
	const { data, isLoading } = useGetPostById(id);
	const fetchIsFollowing = useIsFollowingThisUser(data?.author._id);
	const detailsDialogControl = useDetailsDialogControl();
	const { openModal } = useModalControls();
	const currentUser = useGetCurrentUser();
	const openDetailsDialog = useCallback(() => {
		detailsDialogControl.open();
	}, [detailsDialogControl]);
	const followUser = useFollowUser();
	const unfollowUser = useUnfollowUser();
	const urls = data?.images.filter((e) => e !== null) ?? [];
	const isMe = data?.author._id === currentUser.data?._id;
	useMarkNotificationsAsRead(id);
	useFetchPostComments(id as Id<'posts'>);

	const handleFollow = useCallback(async () => {
		await followUser.mutateAsync(data?.author._id as Id<'users'>);
	}, [followUser.mutateAsync, data?.author._id]);

	const handleUnfollow = useCallback(async () => {
		await unfollowUser.mutateAsync(data?.author._id as Id<'users'>);
	}, [unfollowUser.mutateAsync, data?.author._id]);
	const hasLiked = useQuery(api.users.hasLikedPost, {
		postId: id as Id<'posts'>,
	});
	const handleLike = useCallback(() => {
		if (hasLiked) {
			unlikePost.mutate({ postId: id as Id<'posts'> });
		} else {
			likePost.mutate({ postId: id as Id<'posts'> });
		}
	}, [hasLiked, id]);
	const likePost = useLikePost();
	const unlikePost = useUnlikePost();

	const openEditPostModal = useCallback(() => {
		openModal({
			name: 'edit-post',
			id,
		});
	}, [openModal]);

	const exportCoffeeDetails = useCallback(async () => {
		try {
		} catch (error) {
			console.error('Error exporting coffee details:', error);
			Alert.alert('Error', 'Could not export coffee details');
		}
	}, [data]);

	//NOTE: open comment list modal when the page is focused and mark notifications as read
	useFocusEffect(
		useCallback(() => {
			openModal({
				name: 'comment-list',
				postId: id as Id<'posts'>,
			});
			// handleNotifications();
		}, [openModal]),
	);

	if (isLoading) {
		return (
			<View className="flex-1 items-center justify-center">
				<Loader />
			</View>
		);
	}
	return (
		<ScrollView
			className="flex-1 bg-background"
			contentContainerClassName="pb-20 px-4"
		>
			<Stack.Screen
				options={{
					headerRight: () => (
						<View className="flex-row">
							<Button onPress={exportCoffeeDetails} size="icon" variant="ghost">
								<Share size={24} />
							</Button>
							{isMe && (
								<Button onPress={openDetailsDialog} size="icon" variant="ghost">
									<Ellipsis />
								</Button>
							)}
						</View>
					),
				}}
			/>
			<View className="mb-4">
				<View className="flex-row items-center justify-between my-4">
					<Link push asChild href={`/profiles/${data?.author._id}`}>
						<Pressable>
							<View className="flex-row items-center gap-2">
								<UserAvatar size="sm" avatar={data?.author.avatarUrl} />
								<Text className="font-bold">{data?.author?.name}</Text>
							</View>
						</Pressable>
					</Link>
					{!isMe &&
						(fetchIsFollowing.data ? (
							<Button
								onPress={handleUnfollow}
								size={'sm'}
								weight={'semibold'}
								variant={'muted'}
							>
								<Text className="text-sm font-semibold text-muted-foreground">
									{t`Following`}
								</Text>
							</Button>
						) : (
							<Button onPress={handleFollow} size={'sm'} weight={'semibold'}>
								<Text className="text-sm font-semibold text-background">
									{t`Follow`}
								</Text>
							</Button>
						))}
				</View>
				{data?.beanProfile ? (
					<Text className="text-2xl font-semibold">
						{`${data?.beanProfile?.roaster} ${data?.beanProfile?.origin} ${data?.beanProfile?.farm} ${data?.beanProfile?.process} ${data?.beanProfile?.variety}`}
					</Text>
				) : (
					<Text className="text-2xl font-semibold">{data?.bean}</Text>
				)}
			</View>

			<FlatList
				data={urls}
				horizontal
				className="mb-4"
				keyExtractor={(_, index) => index.toString()}
				ItemSeparatorComponent={() => <View className="w-1" />}
				renderItem={({ item, index }) => (
					<Pressable
						onPress={() => {
							setViewImageIndex(index);
							setVisible(true);
						}}
					>
						<Image
							contentFit="cover"
							style={{ height: 180, aspectRatio: 1, borderRadius: 8 }}
							source={{ uri: item }}
						/>
					</Pressable>
				)}
			/>

			{/* Coffee Identity Card */}
			<View className="bg-card rounded-xl mb-4 overflow-hidden shadow">
				<View className="bg-blue-500 px-3 py-2">
					<Text className="text-white font-bold text-base">
						Coffee Identity
					</Text>
				</View>
				<View className="p-2">
					{data?.beanProfile ? (
						<>
							<DataRow label="Roaster" value={data.beanProfile.roaster} />
							<DataRow label="Origin" value={data?.beanProfile.origin} />
							<DataRow label="Producer" value={data?.beanProfile.producer} />
							<DataRow label="Farm" value={data?.beanProfile.farm} />
							<DataRow label="Process" value={data?.beanProfile.process} />
							<DataRow label="Variety" value={data?.beanProfile.variety} />
							<DataRow
								label="Elevation (masl)"
								value={data?.beanProfile.elevation}
							/>
						</>
					) : (
						<DataRow label="Bean" value={data?.bean} />
					)}
					<DataRow label="Flavor" value={data?.flavor} />
					<DataRow label="Roast Level" value={data?.roastLevel} />
				</View>
			</View>

			{/* Brewing Parameters Card */}
			<View className="bg-card rounded-xl mb-4 overflow-hidden shadow">
				<View className="bg-emerald-500 px-3 py-2">
					<Text className="text-white font-bold text-base">
						Brewing Parameters
					</Text>
				</View>
				<View className="flex-row flex-wrap">
					<View className="w-1/2 p-4 items-center border-r border-b border-border">
						<Text className="text-muted-foreground text-xs mb-1">
							Coffee (g)
						</Text>
						<Text className="text-foreground text-xl font-bold">
							{data?.coffeeIn}
						</Text>
					</View>
					<View className="w-1/2 p-4 items-center border-b border-border">
						<Text className="text-muted-foreground text-xs mb-1">Ratio</Text>
						<Text className="text-foreground text-xl font-bold">
							{data?.ratio?.replace('/', ':')}
						</Text>
					</View>
					<View className="w-1/2 p-4 items-center border-r border-b border-border">
						<Text className="text-muted-foreground text-xs mb-1">
							Water (g)
						</Text>
						<Text className="text-foreground text-xl font-bold">
							{data?.waterIn}
						</Text>
					</View>
					<View className="w-1/2 p-4 items-center border-b border-border">
						<Text className="text-muted-foreground text-xs mb-1">
							Yield (g)
						</Text>
						<Text className="text-foreground text-xl font-bold">
							{data?.beverageWeight}
						</Text>
					</View>
					<View className="w-full p-4 items-center">
						<Text className="text-muted-foreground text-xs mb-1">
							Temperature (°C)
						</Text>
						<Text className="text-foreground text-xl font-bold">
							{data?.brewTemperature}
						</Text>
					</View>
					<View className="w-full border-t border-border">
						<DataRow label="Preparation" value={data?.methodName} />
					</View>
				</View>
			</View>

			{/* Equipment Card */}
			<View className="bg-card rounded-xl mb-4 overflow-hidden shadow">
				<View className="bg-purple-500 px-3 py-2">
					<Text className="text-white font-bold text-base">Equipment</Text>
				</View>
				<View className="p-2">
					<DataRow
						label="Brewer"
						value={data?.brewerId ? data?.brewerDetails?.name : data?.brewer}
					/>
					<DataRow
						label="Filter Paper"
						value={
							data?.filterPaperId
								? data?.filterPaperDetails?.name
								: data?.filterPaper
						}
					/>
					<DataRow label="Water" value={data?.brewingWater} />
					<DataRow
						label="Grinder"
						value={data?.grinderId ? data?.grinderDetails?.name : data?.grinder}
					/>
					<DataRow label="Grind Setting" value={data?.grindSetting} />
					<DataRow label="Other Tools" value={data?.otherTools} />
				</View>
			</View>

			{/* Technical Details Card */}
			<View className="bg-card rounded-xl mb-4 overflow-hidden shadow">
				<View className="bg-cyan-500 px-3 py-2">
					<Text className="text-white font-bold text-base">
						Technical Details
					</Text>
				</View>
				<View className="p-2">
					<DataRow label="TDS" value={data?.tds?.toFixed(2)} />
					<DataRow label="Extraction Yield" value={data?.ey?.toFixed(2)} />
					<DataRow label="Bloom Time" value={data?.bloomTime} />
					<DataRow label="Total Time" value={data?.totalDrawdownTime} />
				</View>
			</View>

			{/* Brewing Steps */}
			{data?.recipeSteps && data.recipeSteps.length > 0 && (
				<View className="bg-card rounded-xl mb-4 overflow-hidden shadow">
					<View className="bg-indigo-500 px-3 py-2">
						<Text className="text-white font-bold text-base">
							Brewing Steps
						</Text>
					</View>
					<View className="p-2">
						{data.recipeSteps.map((step, index) => (
							<View key={index} className="py-2 border-b border-border">
								<Text className="font-medium">{step.timestamp}</Text>
								<View className="flex-row justify-between">
									<Text className="flex-1">{step.action}</Text>
									<Text className="ml-4">{step.value}(s)</Text>
								</View>
							</View>
						))}
					</View>
				</View>
			)}

			<ImageView
				images={urls.map((e) => ({ uri: e! }))}
				visible={visible}
				onRequestClose={() => setVisible(false)}
				imageIndex={viewImageIndex}
			/>
			<DetailsDialog
				control={detailsDialogControl}
				params={{
					type: 'post-details',
					openModal: openEditPostModal,
					isOwner: isMe,
				}}
			/>
		</ScrollView>
	);
}

const DataRow = ({
	label,
	value,
}: {
	label: string;
	value: string | number | undefined;
}) => {
	if (!value) return null;
	return (
		<View className="flex-row justify-between py-3 px-4 border-b border-border">
			<Text className="text-muted-foreground">{label}</Text>
			<Text className="font-medium">{value}</Text>
		</View>
	);
};
