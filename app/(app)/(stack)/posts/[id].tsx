import { Link, Stack, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { View, ScrollView, FlatList, Pressable } from 'react-native';
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
			className="flex-1 p-4 gap-4"
			contentContainerClassName="pb-[30%]"
		>
			<Stack.Screen
				options={{
					headerRight: () =>
						isMe ? (
							<Button onPress={openDetailsDialog} size="icon" variant="ghost">
								<Ellipsis />
							</Button>
						) : null,
				}}
			/>
			<View className="px-2 flex-1 gap-4">
				<View className="flex-row items-center justify-between">
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
				<FlatList
					data={urls}
					horizontal
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
				<View className="rounded-lg">
					<H4>Basic Information</H4>
					{data?.beanProfile ? (
						<>
							<DetailItem label="Roaster" value={data.beanProfile.roaster} />
							<DetailItem label="Origin" value={data?.beanProfile.origin} />
							<DetailItem label="Producer" value={data?.beanProfile.producer} />
							<DetailItem label="Farm" value={data?.beanProfile.farm} />
							<DetailItem label="Process" value={data?.beanProfile.process} />
							<DetailItem label="Variety" value={data?.beanProfile.variety} />
							<DetailItem
								label="Elevation (masl)"
								value={data?.beanProfile.elevation}
							/>
						</>
					) : (
						<DetailItem label="Bean" value={data?.bean} />
					)}
					<DetailItem label="Flavor" value={data?.flavor} />
					<DetailItem label="Roast Level" value={data?.roastLevel} />
				</View>

				{/* Brewing Parameters */}
				<View className="rounded-lg ">
					<H4>Brewing Parameters</H4>
					<DetailItem label="Coffee In (g)" value={data?.coffeeIn} />
					<DetailItem label="Ratio" value={data?.ratio?.replace('/', ':')} />
					<DetailItem label="Water In (g)" value={data?.waterIn} />
					<DetailItem
						label="Beverage Weight (g)"
						value={data?.beverageWeight}
					/>
					<DetailItem label="Temperature (°C)" value={data?.brewTemperature} />
					<DetailItem label="Preparation" value={data?.methodName} />
				</View>

				{/* Equipment */}
				<View className="rounded-lg ">
					<H4>Equipment</H4>
					<DetailItem
						label="Brewer"
						value={data?.brewerId ? data?.brewerDetails?.name : data?.brewer}
					/>
					<DetailItem
						label="Filter Paper"
						value={
							data?.filterPaperId
								? data?.filterPaperDetails?.name
								: data?.filterPaper
						}
					/>
					<DetailItem label="Water" value={data?.brewingWater} />
					<DetailItem
						label="Grinder"
						value={data?.grinderId ? data?.grinderDetails?.name : data?.grinder}
					/>
					<DetailItem label="Grind Setting" value={data?.grindSetting} />
					<DetailItem label="Other Tools" value={data?.otherTools} />
				</View>

				{/* Technical Details */}
				<View className="rounded-lg ">
					<H4>Technical Details</H4>
					<DetailItem label="TDS" value={data?.tds?.toFixed(2)} />
					<DetailItem label="Extraction Yield" value={data?.ey?.toFixed(2)} />
					<DetailItem label="Bloom Time" value={data?.bloomTime} />
					<DetailItem label="Total Time" value={data?.totalDrawdownTime} />
				</View>
			</View>
			{/* Basic Info Section */}

			{/* Brewing Steps */}
			{data?.recipeSteps && data.recipeSteps.length > 0 && (
				<View className="rounded-lg p-4 ">
					<H4>Brewing Steps</H4>
					{data.recipeSteps.map((step, index) => (
						<View key={index} className="py-2 border-b border-gray-200">
							<Text className="font-medium">{step.timestamp}</Text>
							<View className="flex-row justify-between">
								<Text className="flex-1 text-gray-800 dark:text-gray-200">
									{step.action}
								</Text>
								<Text className="ml-4 text-gray-800 dark:text-gray-200">
									{step.value}(s)
								</Text>
							</View>
						</View>
					))}
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

const DetailItem = ({
	label,
	value,
}: {
	label: string;
	value: string | number | undefined;
}) => {
	if (!value) return null;
	return (
		<View className="flex-row justify-between py-2 border-b border-gray-200">
			<Text className="font-semibold mr-2">{label}</Text>
			<Text className="flex-1 text-right">{value}</Text>
		</View>
	);
};
