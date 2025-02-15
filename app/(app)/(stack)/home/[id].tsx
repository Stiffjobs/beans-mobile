import { Stack, useLocalSearchParams } from 'expo-router';
import { View, ScrollView, FlatList, Pressable } from 'react-native';
import { Loader } from '~/components/Loader';
import { useGetPostById } from '~/state/queries/post';
import { Image } from 'expo-image';
import { Text } from '~/components/ui/text';
import { useState } from 'react';
import ImageView from 'react-native-image-viewing';
import { Button } from '~/components/ui/button';
import { StyledIcon } from '~/view/com/icons/StyledIcons';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '~/components/ui/dialog';

export default function PostDetailsPage() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const [viewImageIndex, setViewImageIndex] = useState(0);
	const [visible, setVisible] = useState(false);
	const { data, isLoading } = useGetPostById(id);

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
					headerRight: () => (
						<Dialog>
							<DialogTrigger asChild>
								<Button size={'icon'} variant="ghost">
									<StyledIcon name="Trash2" className="w-6 h-6 text-red-600" />
								</Button>
							</DialogTrigger>
							<DialogContent className="sm:max-w-[425px]">
								<DialogHeader>
									<DialogTitle>Delete Post</DialogTitle>
									<DialogDescription>
										Are you sure you want to delete this post? This action is
										irreversible.
									</DialogDescription>
								</DialogHeader>
								<DialogFooter>
									<DialogClose asChild>
										<Button variant={'destructive'}>
											<Text>Delete</Text>
										</Button>
									</DialogClose>
								</DialogFooter>
							</DialogContent>
						</Dialog>
					),
				}}
			/>
			<Text className="text-2xl font-bold mb-4">{data?.bean}</Text>
			<FlatList
				data={urls}
				horizontal
				keyExtractor={(item, index) => index.toString()}
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
			{/* Basic Info Section */}
			<View className="rounded-lg p-4 ">
				<Text className="text-lg font-semibold mb-2">Basic Information</Text>
				<DetailItem label="Bean" value={data?.bean} />
				<DetailItem label="Flavor" value={data?.flavor} />
				<DetailItem label="Roast Level" value={data?.roastLevel} />
			</View>

			{/* Brewing Parameters */}
			<View className="rounded-lg p-4 ">
				<Text className="text-lg font-semibold mb-2">Brewing Parameters</Text>
				<DetailItem label="Coffee In (g)" value={data?.coffeeIn} />
				<DetailItem label="Ratio" value={data?.ratio?.replace('/', ':')} />
				<DetailItem label="Beverage Weight (g)" value={data?.beverageWeight} />
				<DetailItem label="Temperature (°C)" value={data?.brewTemperature} />
				<DetailItem label="Method" value={data?.preparationMethod} />
			</View>

			{/* Equipment */}
			<View className="rounded-lg p-4 ">
				<Text className="text-lg font-semibold mb-2">Equipment</Text>
				<DetailItem label="Filter Paper" value={data?.filterPaper} />
				<DetailItem label="Water" value={data?.water} />
				<DetailItem label="Grinder" value={data?.grinder} />
				<DetailItem label="Grind Setting" value={data?.grindSetting} />
			</View>

			{/* Technical Details */}
			<View className="rounded-lg p-4 ">
				<Text className="text-lg font-semibold mb-2">Technical Details</Text>
				<DetailItem label="TDS" value={data?.tds} />
				<DetailItem label="Extraction Yield" value={data?.ey} />
				<DetailItem label="Bloom Time" value={data?.bloomTime} />
				<DetailItem label="Total Time" value={data?.time} />
			</View>

			{/* Brewing Steps */}
			{data?.steps && data.steps.length > 0 && (
				<View className="rounded-lg p-4 ">
					<Text className="text-lg font-semibold mb-2">Brewing Steps</Text>
					{data.steps.map((step, index) => (
						<View key={index} className="py-2 border-b border-gray-200">
							<Text className="font-medium">{step.timestamp}</Text>
							<View className="flex-row justify-between">
								<Text className="text-gray-600 dark:text-gray-400">
									{step.action}
								</Text>
								<Text className="text-gray-900 dark:text-gray-100">
									{step.value}(s)
								</Text>
							</View>
						</View>
					))}
				</View>
			)}

			{/* Additional Information */}
			<View className="rounded-lg p-4 ">
				<Text className="text-lg font-semibold mb-2">
					Additional Information
				</Text>
				<DetailItem label="Profile" value={data?.profile} />
				<DetailItem label="Preparation Tools" value={data?.preparationTools} />
				<DetailItem label="Other Notes" value={data?.others} />
			</View>
			<View className="h-8" />
			<ImageView
				images={urls.map(e => ({ uri: e }))}
				visible={visible}
				onRequestClose={() => setVisible(false)}
				imageIndex={viewImageIndex}
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
}) => (
	<View className="flex-row justify-between py-2 border-b border-gray-200">
		<Text className=" font-medium">{label}</Text>
		<Text className="">{value}</Text>
	</View>
);
