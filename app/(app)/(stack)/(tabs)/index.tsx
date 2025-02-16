import { Pressable, ScrollView, View } from 'react-native';
import { useModalControls } from '~/state/modals';
import { Calendar, DateData } from 'react-native-calendars';
import { StyledIcon } from '~/view/com/icons/StyledIcons';
import { Link, router, Stack } from 'expo-router';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { Authenticated, Unauthenticated } from 'convex/react';
import { Loader } from '~/components/Loader';
import { useListPosts } from '~/state/queries/post';
import { useState } from 'react';
import { formatDate } from '~/lib/utils';
import { useCalendarTheme } from '~/hooks/useCalendarTheme';
import { Hamburger } from '~/view/com/util/Hamburger';

export default function TabOneScreen() {
	const { openModal } = useModalControls();
	const fetchListPosts = useListPosts();
	const [selectedDate, setSelectedDate] = useState<string>(
		formatDate(new Date().getTime())
	);
	const markedDates =
		fetchListPosts.data?.reduce((acc, post) => {
			const date = formatDate(post._creationTime);
			return {
				...acc,
				[date]: { marked: true },
			};
		}, {}) || {};
	const openCreatePostModal = () => {
		console.log('opencreate modal');
		openModal({
			name: 'create-post',
		});
	};
	const { key, theme } = useCalendarTheme();
	if (fetchListPosts.isLoading) {
		return (
			<View className="flex-1 items-center justify-center">
				<Loader />
			</View>
		);
	}
	return (
		<View className="flex-1">
			<Authenticated>
				<ScrollView className="flex-1">
					<Stack.Screen
						options={{
							headerLeft: () => <Hamburger />,
						}}
					/>
					<View className="flex-1">
						<Calendar
							key={key}
							theme={theme}
							enableSwipeMonths
							reservationsBackgroundColor
							markedDates={markedDates}
							onDayPress={(day: DateData) => {
								setSelectedDate(day.dateString);
							}}
						/>
						{fetchListPosts.data?.map(
							post =>
								formatDate(post._creationTime) === selectedDate && (
									<BrewingCard key={post._id} data={post} />
								)
						)}
						<Link asChild href={'/home/modal'}>
							<Button>
								<Text>Open Modal</Text>
							</Button>
						</Link>
					</View>
				</ScrollView>
				<View className="absolute bottom-4  right-4 ">
					<Pressable
						className="h-16 aspect-square bg-primary active:opacity-90 rounded-full items-center justify-center"
						onPress={openCreatePostModal}
					>
						<StyledIcon
							name="Plus"
							className="w-8 h-8 text-primary-foreground"
						/>
					</Pressable>
				</View>
			</Authenticated>
			<Unauthenticated>
				<View className="flex-1 items-center justify-center">
					<Link asChild href={'/signin'}>
						<Button>
							<Text>Login</Text>
						</Button>
					</Link>
				</View>
			</Unauthenticated>
		</View>
	);
}
function BrewingCard({ data }: { data: BrewingData }) {
	return (
		<Pressable onPress={() => router.navigate(`/home/${data._id}`)}>
			<View className="mx-4 my-2 rounded-lg p-3 border border-gray-200">
				{/* Header */}
				<View className="flex-row justify-between items-center mb-2">
					<View className="flex-1">
						<Text className="text-lg font-semibold">{data.bean}</Text>
						<Text className="text-gray-600 dark:text-gray-400 text-sm">
							{data.profile}
						</Text>
					</View>
					<Text className="text-gray-500 dark:text-gray-400">{data.time}</Text>
				</View>

				{/* Key Metrics */}
				<View className="flex-row justify-between mb-2">
					<Text className="text-gray-600 dark:text-gray-400">
						{data.coffeeIn}g / {data.beverageWeight}g
					</Text>
					<Text className="text-gray-600 dark:text-gray-400">
						{data.brewTemperature}°C
					</Text>
				</View>

				{/* Equipment (single line) */}
				<Text className="text-gray-600 dark:text-gray-400 text-sm">
					{data.preparationMethod} · {data.grinder} ({data.grindSetting})
				</Text>
			</View>
		</Pressable>
	);
}
interface BrewingData {
	_creationTime: number;
	_id: string;
	author: string;
	bean: string;
	beverageWeight: string;
	bloomTime: string;
	brewTemperature: string;
	coffeeIn: string;
	ey: number;
	filterPaper: string;
	flavor: string;
	grindSetting: string;
	grinder: string;
	others: string;
	preparationMethod: string;
	preparationTools: string;
	profile: string;
	ratio: string;
	roastLevel: string;
	tds: number;
	time: string;
	water: string;
}
