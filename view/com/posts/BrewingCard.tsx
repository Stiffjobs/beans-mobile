import { FeedPost } from '~/convex/types';
import { Link, router } from 'expo-router';
import { Pressable, View } from 'react-native';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '~/components/ui/card';
import { Text } from '~/components/ui/text';

export function BrewingCard({ feedPost }: { feedPost: FeedPost }) {
	const post = feedPost.post;
	return (
		<Link asChild href={`/posts/${post._id}`}>
			<Pressable>
				<Card className="mx-4 my-2">
					<CardHeader className="pb-2">
						<View className="flex-row justify-between items-center">
							<View className="flex-1">
								{feedPost.beanProfile ? (
									<CardTitle className="text-primary">
										{`${feedPost.beanProfile?.roaster} ${feedPost.beanProfile?.origin} ${feedPost.beanProfile?.farm} ${feedPost.beanProfile?.process} ${feedPost.beanProfile?.variety}`}
									</CardTitle>
								) : (
									<CardTitle className="text-primary">{post.bean}</CardTitle>
								)}
								<CardDescription>
									{feedPost.brewerDetails?.name ?? post.brewer}
								</CardDescription>
							</View>
							<Text className="text-gray-500 dark:text-gray-400">
								{post.totalDrawdownTime}
							</Text>
						</View>
					</CardHeader>

					<CardContent className="py-2">
						<View className="flex-row justify-between mb-2">
							<Text className="text-gray-600 dark:text-gray-400">
								{post.coffeeIn}g / {post.beverageWeight}g
							</Text>
							<Text className="text-gray-600 dark:text-gray-400">
								{post.brewTemperature}°C
							</Text>
						</View>
					</CardContent>

					<CardFooter className="pt-0">
						<Text className=" text-secondary-foreground  text-sm">
							{post.methodName} · {post.grinder} ({post.grindSetting})
						</Text>
					</CardFooter>
				</Card>
			</Pressable>
		</Link>
	);
}
