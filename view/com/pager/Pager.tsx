import { useFocusEffect } from 'expo-router';
import { forwardRef, useCallback, useContext } from 'react';
import React from 'react';
import { DrawerGestureContext } from 'react-native-drawer-layout';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import PagerView, {
	PageScrollStateChangedNativeEventData,
	PagerViewOnPageScrollEventData,
	PagerViewOnPageSelectedEventData,
} from 'react-native-pager-view';
import Animated, {
	SharedValue,
	runOnJS,
	useEvent,
	useHandler,
	useSharedValue,
} from 'react-native-reanimated';
import { useSetDrawerSwipeDisabled } from '~/state/shell';
import { View } from 'react-native';
import { TabBar } from './TabBar';
import { BlockDrawerGesture } from '~/view/shell/BlockDrawerGesture';

const AnimatedPagerView = Animated.createAnimatedComponent(PagerView);

export interface PagerRef {
	setPage: (index: number) => void;
}
export interface RenderTabBarFnProps {
	selectedPage: number;
	onSelect?: (index: number) => void;
	tabBarAnchor?: JSX.Element | null | undefined; // Ignored on native.
	dragProgress: SharedValue<number>; // Ignored on web.
	dragState: SharedValue<'idle' | 'dragging' | 'settling'>; // Ignored on web.
}
export type RenderTabBarFn = (props: RenderTabBarFnProps) => JSX.Element;
interface Props {
	initialPage?: number;
	tabBarItems?: string[];
	onPageSelected?: (index: number) => void;
	onPageScrollStateChanged?: (
		scrollState: 'idle' | 'dragging' | 'settling'
	) => void;
}

export const Pager = forwardRef<PagerRef, React.PropsWithChildren<Props>>(
	function PagerImpl(
		{
			children,
			initialPage = 0,
			tabBarItems,
			onPageScrollStateChanged: parentOnPageScrollStateChanged,
			onPageSelected: parentOnPageSelected,
		}: React.PropsWithChildren<Props>,
		ref
	) {
		const [selectedPage, setSelectedPage] = React.useState(initialPage);
		const pagerView = React.useRef<PagerView>(null);

		const [isIdle, setIsIdle] = React.useState(true);
		const setDrawerSwipeDisabled = useSetDrawerSwipeDisabled();
		useFocusEffect(
			useCallback(() => {
				const canSwipeDrawer = selectedPage === 0 && isIdle;
				setDrawerSwipeDisabled(!canSwipeDrawer);
				return () => {
					setDrawerSwipeDisabled(false);
				};
			}, [setDrawerSwipeDisabled, selectedPage, isIdle])
		);

		React.useImperativeHandle(ref, () => ({
			setPage: (index: number) => {
				pagerView.current?.setPage(index);
			},
		}));

		const onPageSelectedJSThread = React.useCallback(
			(nextPosition: number) => {
				setSelectedPage(nextPosition);
				parentOnPageSelected?.(nextPosition);
			},
			[setSelectedPage, parentOnPageSelected]
		);

		const onTabBarSelect = React.useCallback(
			(index: number) => {
				pagerView.current?.setPage(index);
			},
			[pagerView]
		);

		const dragState = useSharedValue<'idle' | 'settling' | 'dragging'>('idle');
		const dragProgress = useSharedValue(selectedPage);
		const didInit = useSharedValue(false);
		const handlePageScroll = usePagerHandlers(
			{
				onPageScroll(e: PagerViewOnPageScrollEventData) {
					'worklet';
					if (didInit.get() === false) {
						// On iOS, there's a spurious scroll event with 0 position
						// even if a different page was supplied as the initial page.
						// Ignore it and wait for the first confirmed selection instead.
						return;
					}
					dragProgress.set(e.offset + e.position);
				},
				onPageScrollStateChanged(e: PageScrollStateChangedNativeEventData) {
					'worklet';
					runOnJS(setIsIdle)(e.pageScrollState === 'idle');
					if (dragState.get() === 'idle' && e.pageScrollState === 'settling') {
						// This is a programmatic scroll on Android.
						// Stay "idle" to match iOS and avoid confusing downstream code.
						return;
					}
					dragState.set(e.pageScrollState);
					parentOnPageScrollStateChanged?.(e.pageScrollState);
				},
				onPageSelected(e: PagerViewOnPageSelectedEventData) {
					'worklet';
					didInit.set(true);
					runOnJS(onPageSelectedJSThread)(e.position);
				},
			},
			[parentOnPageScrollStateChanged]
		);

		const drawerGesture = useContext(DrawerGestureContext) ?? Gesture.Native(); // noop for web
		const nativeGesture =
			Gesture.Native().requireExternalGestureToFail(drawerGesture);

		return (
			<View className="flex-1">
				{tabBarItems && (
					<TabBar
						selectedPage={selectedPage}
						dragProgress={dragProgress}
						dragState={dragState}
						onSelect={onTabBarSelect}
						items={tabBarItems}
					/>
				)}
				<GestureDetector gesture={nativeGesture}>
					<AnimatedPagerView
						style={{ flex: 1 }}
						initialPage={initialPage}
						onPageScroll={handlePageScroll}
						ref={pagerView}
					>
						{children}
					</AnimatedPagerView>
				</GestureDetector>
			</View>
		);
	}
);
function usePagerHandlers(
	handlers: {
		onPageScroll: (e: PagerViewOnPageScrollEventData) => void;
		onPageScrollStateChanged: (
			e: PageScrollStateChangedNativeEventData
		) => void;
		onPageSelected: (e: PagerViewOnPageSelectedEventData) => void;
	},
	dependencies: unknown[]
) {
	const { doDependenciesDiffer } = useHandler(handlers as any, dependencies);
	const subscribeForEvents = [
		'onPageScroll',
		'onPageScrollStateChanged',
		'onPageSelected',
	];
	return useEvent(
		event => {
			'worklet';
			const { onPageScroll, onPageScrollStateChanged, onPageSelected } =
				handlers;
			if (event.eventName.endsWith('onPageScroll')) {
				onPageScroll(event as any as PagerViewOnPageScrollEventData);
			} else if (event.eventName.endsWith('onPageScrollStateChanged')) {
				onPageScrollStateChanged(
					event as any as PageScrollStateChangedNativeEventData
				);
			} else if (event.eventName.endsWith('onPageSelected')) {
				onPageSelected(event as any as PagerViewOnPageSelectedEventData);
			}
		},
		subscribeForEvents,
		doDependenciesDiffer
	);
}
