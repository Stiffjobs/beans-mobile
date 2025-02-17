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
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
} from '~/components/ui/card';

export default function HomeScreen() {
	const { openModal } = useModalControls();
	const fetchListPosts = useListPosts();
	const [selectedDate, setSelectedDate] = useState<string>(
		formatDate(new Date().getTime())
	);
	const markedDates = fetchListPosts.data?.reduce((acc, post) => {
		const date = post.createdDate;
		return {
			...acc,
			[date]: { marked: true },
			[selectedDate]: { marked: date === selectedDate, selected: true },
		};
	}, {}) || { [selectedDate]: { selected: true } };
	const openCreatePostModal = () => {
		console.log('opencreate modal');
		openModal({
			name: 'create-post',
			selectedDate: selectedDate,
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
			<Card className="mx-4 my-2">
				<CardHeader className="pb-2">
					<View className="flex-row justify-between items-center">
						<View className="flex-1">
							<CardTitle className="text-primary">{data.bean}</CardTitle>
							<CardDescription>{data.brewer}</CardDescription>
						</View>
						<Text className="text-gray-500 dark:text-gray-400">
							{data.totalDrawdownTime}
						</Text>
					</View>
				</CardHeader>

				<CardContent className="py-2">
					<View className="flex-row justify-between mb-2">
						<Text className="text-gray-600 dark:text-gray-400">
							{data.coffeeIn}g / {data.beverageWeight}g
						</Text>
						<Text className="text-gray-600 dark:text-gray-400">
							{data.brewTemperature}°C
						</Text>
					</View>
				</CardContent>

				<CardFooter className="pt-0">
					<Text className=" text-secondary-foreground  text-sm">
						{data.methodName} · {data.grinder} ({data.grindSetting})
					</Text>
				</CardFooter>
			</Card>
		</Pressable>
	);
}
interface BrewingData {
	_creationTime: number;
	_id: string;
	author: string;
	createdDate: string;
	bean: string;
	roastLevel: string;
	coffeeIn: string;
	ratio: string;
	beverageWeight: string;
	brewTemperature: string;
	filterPaper: string;
	grinder: string;
	grindSetting: string;
	bloomTime: string;
	totalDrawdownTime?: string;
	brewingWater?: string;
	recipeSteps?: {
		timestamp: string;
		action: string;
		value: number;
	}[];
	methodName?: string;
	brewer?: string;
	otherTools?: string;
	flavor?: string;
	tds?: number;
	ey?: number;
}
