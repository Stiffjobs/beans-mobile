import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, View } from 'react-native';
import {
	Gesture,
	GestureDetector,
	GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
	FadeInUp,
	FadeOutUp,
	runOnJS,
	useAnimatedReaction,
	useAnimatedStyle,
	useSharedValue,
	withDecay,
	withSpring,
} from 'react-native-reanimated';
import RootSiblings from 'react-native-root-siblings';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '~/components/ui/text';
import { IconName, StyledIcon } from '../icons/StyledIcons';
import { cn } from '~/lib/utils';

const TIMEOUT = 2e3;

export function show(
	message: string,
	icon: IconName,
	variant?: 'success' | 'error' | 'warning' | 'default'
) {
	if (process.env.NODE_ENV === 'test') {
		return;
	}
	AccessibilityInfo.announceForAccessibility(message);
	const item = new RootSiblings(
		(
			<Toast
				message={message}
				icon={icon}
				variant={variant}
				destroy={() => item.destroy()}
			/>
		)
	);
}

function Toast({
	message,
	icon,
	variant = 'default',
	destroy,
}: {
	message: string;
	variant?: 'success' | 'error' | 'warning' | 'default';
	icon: IconName;
	destroy: () => void;
}) {
	const { top } = useSafeAreaInsets();
	const isPanning = useSharedValue(false);
	const dismissSwipeTranslateY = useSharedValue(0);
	const [cardHeight, setCardHeight] = useState(0);

	// for the exit animation to work on iOS the animated component
	// must not be the root component
	// so we need to wrap it in a view and unmount the toast ahead of time
	const [alive, setAlive] = useState(true);

	const hideAndDestroyImmediately = () => {
		setAlive(false);
		setTimeout(() => {
			destroy();
		}, 1e3);
	};

	const destroyTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
	const hideAndDestroyAfterTimeout = useCallback(() => {
		clearTimeout(destroyTimeoutRef.current);
		destroyTimeoutRef.current = setTimeout(hideAndDestroyImmediately, TIMEOUT);
	}, []);
	const pauseDestroy = useCallback(() => {
		clearTimeout(destroyTimeoutRef.current);
	}, []);

	useEffect(() => {
		hideAndDestroyAfterTimeout();
	}, [hideAndDestroyAfterTimeout]);

	const panGesture = useMemo(() => {
		return Gesture.Pan()
			.activeOffsetY([-10, 10])
			.failOffsetX([-10, 10])
			.maxPointers(1)
			.onStart(() => {
				'worklet';
				if (!alive) return;
				isPanning.set(true);
				runOnJS(pauseDestroy)();
			})
			.onUpdate(e => {
				'worklet';
				if (!alive) return;
				dismissSwipeTranslateY.value = e.translationY;
			})
			.onEnd(e => {
				'worklet';
				if (!alive) return;
				runOnJS(hideAndDestroyAfterTimeout)();
				isPanning.set(false);
				if (e.velocityY < -100) {
					if (dismissSwipeTranslateY.value === 0) {
						// HACK: If the initial value is 0, withDecay() animation doesn't start.
						// This is a bug in Reanimated, but for now we'll work around it like this.
						dismissSwipeTranslateY.value = 1;
					}
					dismissSwipeTranslateY.value = withDecay({
						velocity: e.velocityY,
						velocityFactor: Math.max(3500 / Math.abs(e.velocityY), 1),
						deceleration: 1,
					});
				} else {
					dismissSwipeTranslateY.value = withSpring(0, {
						stiffness: 500,
						damping: 50,
					});
				}
			});
	}, [
		dismissSwipeTranslateY,
		isPanning,
		alive,
		hideAndDestroyAfterTimeout,
		pauseDestroy,
	]);

	const topOffset = top + 10;

	useAnimatedReaction(
		() =>
			!isPanning.get() &&
			dismissSwipeTranslateY.get() < -topOffset - cardHeight,
		(isSwipedAway, prevIsSwipedAway) => {
			'worklet';
			if (isSwipedAway && !prevIsSwipedAway) {
				runOnJS(destroy)();
			}
		}
	);

	const animatedStyle = useAnimatedStyle(() => {
		const translation = dismissSwipeTranslateY.get();
		return {
			transform: [
				{
					translateY: translation > 0 ? translation ** 0.7 : translation,
				},
			],
		};
	});

	const bgColor =
		variant === 'success'
			? 'bg-green-600'
			: variant === 'error'
				? 'bg-red-600'
				: variant === 'warning'
					? 'bg-yellow-600'
					: 'bg-primary';
	return (
		<GestureHandlerRootView
			style={[{ top: topOffset, left: 16, right: 16 }]}
			className="absolute"
			pointerEvents="box-none"
		>
			{alive && (
				<Animated.View
					entering={FadeInUp}
					exiting={FadeOutUp}
					className="flex-1"
				>
					<Animated.View
						onLayout={evt => setCardHeight(evt.nativeEvent.layout.height)}
						accessibilityRole="alert"
						accessible={true}
						accessibilityLabel={message}
						accessibilityHint=""
						onAccessibilityEscape={hideAndDestroyImmediately}
						className={
							'flex-1 bg-background shadow-md border-border rounded-xl border'
						}
						style={animatedStyle}
					>
						<GestureDetector gesture={panGesture}>
							<View className="flex-1 px-4 py-6 flex-row gap-4">
								<View
									className={cn(
										'flex-shrink-0 rounded-full w-8 h-8  items-center justify-center',
										bgColor
									)}
								>
									<StyledIcon
										name={icon}
										className={cn('h-6 w-6 text-white')}
									/>
								</View>
								<View className="h-full justify-center flex-1">
									<Text className="text-lg font-semibold">{message}</Text>
								</View>
							</View>
						</GestureDetector>
					</Animated.View>
				</Animated.View>
			)}
		</GestureHandlerRootView>
	);
}
