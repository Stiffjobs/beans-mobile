import { Stack, useLocalSearchParams } from 'expo-router';
import { View, ScrollView, FlatList, Pressable } from 'react-native';
import { Loader } from '~/components/Loader';
import { useGetPostById } from '~/state/queries/post';
import { Image } from 'expo-image';
import { Text } from '~/components/ui/text';
import { useCallback, useState } from 'react';
import ImageView from 'react-native-image-viewing';
import { Button } from '~/components/ui/button';
import {
	DetailsDialog,
	useDetailsDialogControl,
} from '~/components/DetailsDialog';
import { useModalControls } from '~/state/modals';
import { useGetCurrentUser } from '~/state/queries/auth';
import { H3, H4 } from '~/components/ui/typography';
import { Ellipsis } from '~/lib/icons/Ellipsis';

export default function PostDetailsPage() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const [viewImageIndex, setViewImageIndex] = useState(0);
	const [visible, setVisible] = useState(false);
	const { data, isLoading } = useGetPostById(id);
	const detailsDialogControl = useDetailsDialogControl();
	const { openModal } = useModalControls();
	const currentUser = useGetCurrentUser();
	const openDetailsDialog = useCallback(() => {
		detailsDialogControl.open();
	}, [detailsDialogControl]);
	const isOwner = data?.author === currentUser.data?._id;

	const openEditPostModal = useCallback(() => {
		openModal({
			name: 'edit-post',
			id,
		});
	}, [openModal]);

	if (isLoading) {
		return (
			<View className="flex-1 items-center justify-center">
				<Loader />
			</View>
		);
	}
	const urls = data?.images.filter(e => e !== null) ?? [];

	return (
		<ScrollView className="flex-1  p-4 gap-4">
			<Stack.Screen
				options={{
					headerRight: () =>
						isOwner ? (
							<Button onPress={openDetailsDialog} size="icon" variant="ghost">
								<Ellipsis />
							</Button>
						) : null,
				}}
			/>
			<View className="px-4 flex-1 gap-4">
				{data?.beanProfile ? (
					<H3>
						{`${data?.beanProfile?.roaster} ${data?.beanProfile?.origin} ${data?.beanProfile?.farm} ${data?.beanProfile?.process} ${data?.beanProfile?.variety}`}
					</H3>
				) : (
					<H3>{data?.bean}</H3>
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
			<View className="h-8" />
			<ImageView
				images={urls.map(e => ({ uri: e! }))}
				visible={visible}
				onRequestClose={() => setVisible(false)}
				imageIndex={viewImageIndex}
			/>
			<DetailsDialog
				control={detailsDialogControl}
				params={{ type: 'post-details', openModal: openEditPostModal, isOwner }}
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
