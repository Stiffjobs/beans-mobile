import * as Dialog from '~/components/Dialog';
import { View, TextInput, FlatList, Image } from 'react-native';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';
import { Separator } from '../ui/separator';
import { CommentsDialogProps } from './types';
import {
	useCreatePostComment,
	useDeletePostComment,
	useFetchPostComments,
} from '~/state/queries/post_comments';
import { Text, TextClassContext } from '~/components/ui/text';
import { Id } from '~/convex/_generated/dataModel';
import { useForm } from '@tanstack/react-form';
import { createPostCommentSchema } from '~/lib/schemas';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import { t } from '@lingui/core/macro';
import { Loader } from '../Loader';
import { Send, X, ChevronLeft, Plus } from '~/lib/icons';
import { BottomSheetFlatList, TouchableOpacity } from '@gorhom/bottom-sheet';
import { BottomSheetInput } from '../input/Input';
import { timeAgo } from '~/utils/time';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cn } from '~/lib/utils';
export { useDialogControl as useCommentsDialogControl } from '~/components/Dialog';

export function CommentsDialog(props: CommentsDialogProps) {
	useEffect(() => {
		if (props.control.ref) {
			props.control.open();
		}
	}, [props.control.ref]);
	const fadeAnim = useSharedValue(0);
	const animatedStyle = useAnimatedStyle(() => ({
		opacity: fadeAnim.value,
	}));
	const onAnimate = (_: number, to: number) => {
		fadeAnim.value = withTiming(to === 1 ? 1 : 0, { duration: 500 });
	};
	return (
		<Dialog.Outer
			snapPoints={Dialog.BottomSheetSnapPoint.Comments}
			control={props.control}
			onAnimte={onAnimate}
			addShadow
			hideBackdrop
		>
			<CommentsDialogInner animatedStyle={animatedStyle} {...props} />
		</Dialog.Outer>
	);
}

function CommentsDialogInner(
	props: CommentsDialogProps & { animatedStyle: { opacity: number } }
) {
	const createCommentMutation = useCreatePostComment();
	const deleteCommentMutation = useDeletePostComment();
	const fetchCommentsQuery = useFetchPostComments(props.params.postId);
	const { index } = Dialog.useDialogContext();
	const [isFocused, setIsFocused] = useState(false);

	const form = useForm({
		defaultValues: {
			comment: '',
		},
		validators: {
			onSubmit: z.object({
				comment: z.string().min(1),
			}),
		},
		onSubmit: async ({ value, formApi }) => {
			if (value.comment.trim()) {
				await createCommentMutation.mutateAsync({
					postId: props.params.postId as Id<'posts'>,
					content: value.comment,
				});
				formApi.reset();
			}
		},
	});

	const handleDeleteComment = async (commentId: string) => {
		await deleteCommentMutation.mutateAsync({
			commentId: commentId as Id<'post_comments'>,
		});
	};
	const handleExpandAndCollapse = () => {
		props.control.toIndex(index === 0 ? 1 : 0);
	};

	if (fetchCommentsQuery.isLoading) {
		return (
			<View className="flex-1 items-center justify-center">
				<Loader />
			</View>
		);
	}

	return (
		<Dialog.Inner className={cn(isFocused ? 'pb-2' : 'pb-safe')}>
			<TouchableOpacity onPress={handleExpandAndCollapse}>
				<View className="flex-row items-center justify-between">
					<Text className="text-2xl font-bold">{t`Comments (${fetchCommentsQuery.data?.length ?? 0})`}</Text>
					<Animated.View style={props.animatedStyle}>
						<View className="rounded-full itemsecen bg-secondary p-2">
							<X strokeWidth={3} className="text-primary size-5" />
						</View>
					</Animated.View>
				</View>
			</TouchableOpacity>
			<Animated.View style={props.animatedStyle} className="flex-1">
				<BottomSheetFlatList
					className="flex-1"
					ListEmptyComponent={() => (
						<View className="flex-1 items-center justify-center">
							{fetchCommentsQuery.isLoading ? (
								<Loader />
							) : (
								<Text>{t`No comments yet`}</Text>
							)}
						</View>
					)}
					contentContainerClassName="pt-2"
					data={fetchCommentsQuery.data}
					ItemSeparatorComponent={() => <View className="h-4" />}
					keyExtractor={item => item._id}
					renderItem={({ item }) => {
						return (
							<View className="">
								<View className="flex-row">
									<View className="h-10 w-10 rounded-full bg-muted overflow-hidden mr-3">
										{item.user?.avatar && (
											<Image
												source={{ uri: item.user.avatar }}
												className="h-full w-full"
											/>
										)}
									</View>
									<View className="bg-secondary p-2 rounded-lg">
										<View className="flex-row items-center gap-1">
											<Text className="font-semibold">{item.user?.name}</Text>
											<Text className="text-muted-foreground">{`• ${timeAgo(item._creationTime)}`}</Text>
										</View>
										<Text className="mt-1">{item.content}</Text>
									</View>
								</View>
							</View>
						);
					}}
				/>
			</Animated.View>
			<Animated.View style={props.animatedStyle}>
				<View className="w-full py-2 flex-row items-center justify-between">
					<form.Field name="comment">
						{field => (
							<BottomSheetInput
								className="flex-1 rounded-xl"
								value={field.state.value}
								onChangeText={field.handleChange}
								placeholder={t`Add a comment...`}
								onFocus={() => setIsFocused(true)}
								onBlur={() => setIsFocused(false)}
							/>
						)}
					</form.Field>
					<form.Subscribe selector={state => [state.values.comment]}>
						{([comment]) =>
							comment.length > 0 && (
								<TouchableOpacity onPress={form.handleSubmit}>
									<View className="p-2 items-center justify-center">
										<Send className="text-coffee" />
									</View>
								</TouchableOpacity>
							)
						}
					</form.Subscribe>
				</View>
			</Animated.View>
		</Dialog.Inner>
	);
}
