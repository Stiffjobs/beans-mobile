import {
	BottomSheetFlatList,
	BottomSheetView,
	TouchableOpacity,
	useBottomSheet,
} from '@gorhom/bottom-sheet';
import { t } from '@lingui/core/macro';
import { useForm, useStore } from '@tanstack/react-form';
import { useEffect, useRef, useState } from 'react';
import { TextInput, View } from 'react-native';
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';
import Animated, {
	interpolate,
	useAnimatedStyle,
	withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '~/components/ui/text';
import { z } from 'zod';
import { Loader } from '~/components/Loader';
import { Id } from '~/convex/_generated/dataModel';
import { Reply, Send, X } from '~/lib/icons';
import { createPostCommentSchema } from '~/lib/schemas';
import { cn } from '~/lib/utils';
import { useModalControls, useModals } from '~/state/modals';
import { useFetchFollowers } from '~/state/queries/post';
import {
	useCreatePostComment,
	useDeletePostComment,
	useFetchPostComments,
} from '~/state/queries/post_comments';
import { UserAvatar } from '../util/UserAvatar';
import { CommentContent } from '~/components/CommentsDialog/CommentContent';
import { MentionSuggestions } from '~/components/CommentsDialog/MentionSuggestions';
import { Input } from '~/components/input/Input';
import { timeAgo } from '~/utils/time';
import { useSegments } from 'expo-router';
import { SheetOptions } from './Modal';

export const snapPoints = ['10%', '100%'];

export const options: SheetOptions = {
	showBackdrop: false,
	addShadow: true,
};

type CommentListModalProps = {
	postId: string;
	snapTo: (index: number) => void;
};
export function Component(props: CommentListModalProps) {
	const { closeModal } = useModalControls();
	const segments = useSegments();
	const { progress: modalProgress, index: modalIndex } = useModals();
	const { animatedIndex } = useBottomSheet();
	const insets = useSafeAreaInsets();
	const createCommentMutation = useCreatePostComment();
	const fetchCommentsQuery = useFetchPostComments(props.postId);
	//NOTE: prefetch followers for mention suggestions
	useFetchFollowers();
	const [mentionSearch, setMentionSearch] = useState<string>('');

	const { height, progress } = useReanimatedKeyboardAnimation();

	useEffect(() => {
		if (segments[2] !== 'posts') {
			console.log('here close');
			closeModal();
		}
	}, [segments]);
	const translateStyle = useAnimatedStyle(() => {
		return {
			transform: [{ translateY: height.value }],
			paddingBottom: interpolate(progress.value, [0, 1], [insets.bottom, 12]),
		};
	});
	const form = useForm({
		defaultValues: {
			content: '',
			postId: props.postId as Id<'posts'>,
		} as z.infer<typeof createPostCommentSchema>,
		validators: {
			onSubmit: createPostCommentSchema,
		},
		onSubmit: async ({ value, formApi }) => {
			if (value.content.trim()) {
				await createCommentMutation.mutateAsync({
					postId: props.postId as Id<'posts'>,
					content: value.content,
				});
				formApi.reset();
			}
		},
	});

	const animatedStyle = useAnimatedStyle(() => {
		return {
			opacity: interpolate(animatedIndex.value, [0, 1], [0, 1]),
		};
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

	/**
	 * Handle the selection of a user for mention
	 *
	 * NOTE: this function setting field if using textInput with onFocus and onBlur, would cause crashing
	 * @param user - The user to mention
	 * @returns void
	 */
	function handleSelectUser(user: { name: string } | null) {
		if (!user) return;
		const words = content.split(' ');
		words[words.length - 1] = `@${user.name} `;
		form.setFieldValue('content', words.join(' '));
		setMentionSearch('');
	}

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
		props.snapTo(modalIndex === 0 ? 1 : 0);
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
		<BottomSheetView className={cn('bg-background px-4 flex-1')}>
			<TouchableOpacity onPress={handleExpandAndCollapse}>
				<View className="flex-row items-center justify-between">
					<Text className="text-2xl font-bold">{t`Comments (${fetchCommentsQuery.data?.length ?? 0})`}</Text>
					<Animated.View style={animatedStyle}>
						<View className="rounded-full itemsecen bg-secondary p-2">
							<X strokeWidth={3} className="text-primary size-5" />
						</View>
					</Animated.View>
				</View>
			</TouchableOpacity>
			<Animated.View style={animatedStyle} className="flex-1">
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
			<Animated.View style={[animatedStyle, translateStyle]}>
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
		</BottomSheetView>
	);
}
