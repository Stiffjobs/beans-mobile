import * as Dialog from '~/components/Dialog';
import { View, TextInput } from 'react-native';
import Animated, {
	useAnimatedKeyboard,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from 'react-native-reanimated';
import { CommentsDialogProps } from './types';
import {
	useCreatePostComment,
	useDeletePostComment,
	useFetchPostComments,
} from '~/state/queries/post_comments';
import { Text } from '~/components/ui/text';
import { Id } from '~/convex/_generated/dataModel';
import { useForm } from '@tanstack/react-form';
import { createPostCommentSchema } from '~/lib/schemas';
import { useEffect, useRef, useState } from 'react';
import { t } from '@lingui/core/macro';
import { Loader } from '../Loader';
import { Send, X, Reply } from '~/lib/icons';
import { BottomSheetFlatList, TouchableOpacity } from '@gorhom/bottom-sheet';
import { Input } from '../input/Input';
import { timeAgo } from '~/utils/time';
import { cn } from '~/lib/utils';
import { CommentContent } from './CommentContent';
import { UserAvatar } from '~/view/com/util/UserAvatar';
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
	const [comment, setComment] = useState('');

	const keyboard = useAnimatedKeyboard();
	const translateStyle = useAnimatedStyle(() => {
		return {
			transform: [{ translateY: -keyboard.height.value }],
		};
	});
	const form = useForm({
		defaultValues: {
			content: '',
		},
		validators: {
			onSubmit: createPostCommentSchema,
		},
		onSubmit: async ({ value, formApi }) => {
			if (value.content.trim()) {
				await createCommentMutation.mutateAsync({
					postId: props.params.postId as Id<'posts'>,
					content: value.content,
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
	const inputRef = useRef<TextInput>(null);

	const handleReplyToComment = (username: string | undefined) => {
		const newContent = comment + `@${username} `;
		setComment(newContent);
		inputRef.current?.focus();
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
							<View className="flex flex-row items-center">
								<View className="flex-row gap-2">
									<UserAvatar avatar={item.user?.avatar} size="sm" />
									<View className="bg-secondary p-2 rounded-lg">
										<View className="flex-row items-center gap-1">
											<Text className="font-semibold">{item.user?.name}</Text>
											<Text className="text-muted-foreground">{`• ${timeAgo(item._creationTime)}`}</Text>
										</View>
										<View className="mt-1">
											<CommentContent content={item.content} />
										</View>
									</View>
								</View>
								<TouchableOpacity
									onPress={() => handleReplyToComment(item.user?.name)}
								>
									<View className="flex items-center ml-2 justify-center bg-muted rounded-full p-2">
										<Reply
											strokeWidth={3}
											className="text-muted-foreground size-4"
										/>
									</View>
								</TouchableOpacity>
							</View>
						);
					}}
				/>
			</Animated.View>
			<Animated.View style={[props.animatedStyle, translateStyle]}>
				<View className="w-full py-2 flex-row items-center justify-between">
					<Input
						className="flex-1 rounded-xl"
						ref={inputRef}
						value={comment}
						onChangeText={setComment}
						placeholder={t`Add a comment...`}
						// onFocus={() => setIsFocused(true)}
						// onBlur={() => setIsFocused(false)}
					/>
					<form.Subscribe selector={state => [state.values.content]}>
						{([content]) =>
							content.length > 0 && (
								<TouchableOpacity onPress={form.handleSubmit}>
									<View className="p-2 items-center ml-2 justify-center rounded-full bg-primary">
										<Send className="text-primary-foreground size-6" />
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
