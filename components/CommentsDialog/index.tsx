import * as Dialog from '~/components/Dialog';
import { View, TextInput } from 'react-native';
import Animated, {
	interpolate,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
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
import { useForm, useStore } from '@tanstack/react-form';
import { createPostCommentSchema } from '~/lib/schemas';
import { useRef, useState } from 'react';
import { useEffect } from 'react';
import { t } from '@lingui/core/macro';
import { Loader } from '../Loader';
import { Send, X, Reply } from '~/lib/icons';
import { BottomSheetFlatList, TouchableOpacity } from '@gorhom/bottom-sheet';
import { Input } from '../input/Input';
import { timeAgo } from '~/utils/time';
import { CommentContent } from './CommentContent';
import { UserAvatar } from '~/view/com/util/UserAvatar';
import { MentionSuggestions } from './MentionSuggestions';
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFetchFollowers } from '~/state/queries/post';
import { z } from 'zod';
import { useSegments } from 'expo-router';
export { useDialogControl as useCommentsDialogControl } from '~/components/Dialog';

export function CommentsDialog(props: CommentsDialogProps) {
	const segments = useSegments();

	useEffect(() => {
		// Close dialog if we navigate away from the post page
		console.log('segments', segments[2]);
		console.log('props.control.id', props.control.id);
		if (segments[2] === 'posts') {
			if (props.control.ref) {
				props.control.open();
			}
		} else {
			props.control.close();
			console.log('close');
		}
	}, [segments, props.control.id]);

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
	const insets = useSafeAreaInsets();
	const createCommentMutation = useCreatePostComment();
	const deleteCommentMutation = useDeletePostComment();
	const fetchCommentsQuery = useFetchPostComments(props.params.postId);
	//NOTE: prefetch followers for mention suggestions
	useFetchFollowers();
	const { index } = Dialog.useDialogContext();
	const [mentionSearch, setMentionSearch] = useState<string>('');

	const { height, progress } = useReanimatedKeyboardAnimation();

	const translateStyle = useAnimatedStyle(() => {
		return {
			transform: [{ translateY: height.value }],
			paddingBottom: interpolate(progress.value, [0, 1], [insets.bottom, 12]),
		};
	});
	const form = useForm({
		defaultValues: {
			content: '',
			postId: props.params.postId as Id<'posts'>,
		} as z.infer<typeof createPostCommentSchema>,
		validators: {
			onSubmit: createPostCommentSchema,
		},
		onSubmit: async ({ value, formApi }) => {
			console.log('value', value);
			if (value.content.trim()) {
				await createCommentMutation.mutateAsync({
					postId: props.params.postId as Id<'posts'>,
					content: value.content,
				});
				formApi.reset();
			}
		},
	});

	const content = useStore(form.store, state => state.values.content);

	useEffect(() => {
		const words = content.split(' ');
		const lastWord = words[words.length - 1];
		if (lastWord.startsWith('@')) {
			setMentionSearch(lastWord);
		} else {
			setMentionSearch('');
		}
	}, [content]);

	const handleSelectUser = (user: { name: string } | null) => {
		if (!user) return;
		const words = content.split(' ');
		words[words.length - 1] = `@${user.name} `;
		form.setFieldValue('content', words.join(' '));
		setMentionSearch('');
	};

	const showSendButtonStyle = useAnimatedStyle(() => {
		const show = content.length > 0;
		return {
			opacity: withSpring(show ? 1 : 0, {
				damping: 10,
				stiffness: 100,
				mass: 0.5,
				velocity: 1,
			}),
			transform: [{ rotate: withSpring(show ? '0deg' : '45deg') }],
		};
	});
	const handleExpandAndCollapse = () => {
		props.control.toIndex(index === 0 ? 1 : 0);
	};
	const inputRef = useRef<TextInput>(null);

	const handleReplyToComment = (username: string | undefined) => {
		form.setFieldValue('content', curr => {
			return curr + `@${username} `;
		});
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
		<Dialog.Inner>
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
							<View className="flex-row flex-1 gap-2">
								<UserAvatar avatar={item.user?.avatar} size="sm" />
								<View className="flex-1 flex-row items-center gap-2">
									<View className="shrink">
										<View className="bg-secondary p-3 rounded-lg ">
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
										<View className="flex items-center justify-center bg-muted rounded-full p-2">
											<Reply
												strokeWidth={3}
												className="text-muted-foreground size-4"
											/>
										</View>
									</TouchableOpacity>
								</View>
							</View>
						);
					}}
				/>
			</Animated.View>
			<Animated.View style={[props.animatedStyle, translateStyle]}>
				{mentionSearch && (
					<MentionSuggestions
						searchText={mentionSearch}
						onSelectUser={handleSelectUser}
					/>
				)}
				<View className="w-full p-2 px-3 rounded-xl border border-input flex-row items-center justify-between bg-background">
					<form.Field
						name="content"
						children={field => {
							return (
								<Input
									className="flex-1"
									transparent
									ref={inputRef}
									value={field.state.value}
									onChangeText={field.handleChange}
									placeholder={t`Add a comment...`}
								/>
							);
						}}
					/>
					<TouchableOpacity onPress={form.handleSubmit}>
						<Animated.View
							style={showSendButtonStyle}
							className={
								'p-2 items-center ml-2 justify-center rounded-full bg-primary'
							}
						>
							<Send
								strokeWidth={3}
								className="text-primary-foreground size-4"
							/>
						</Animated.View>
					</TouchableOpacity>
				</View>
			</Animated.View>
		</Dialog.Inner>
	);
}
