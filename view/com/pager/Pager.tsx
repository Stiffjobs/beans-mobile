import { useFocusEffect } from 'expo-router';
import { useCallback, useContext } from 'react';
import { DrawerGestureContext } from 'react-native-drawer-layout';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Route, TabView, TabViewProps } from 'react-native-tab-view';
import { useSetDrawerSwipeDisabled } from '~/state/shell';

export function Pager({
	index,
	...rest
}: TabViewProps<Route> & { index: number }) {
	const setDrawerSwipeDisabled = useSetDrawerSwipeDisabled();
	useFocusEffect(
		useCallback(() => {
			const canSwipeDrawer = index === 0;
			setDrawerSwipeDisabled(!canSwipeDrawer);
			return () => {
				setDrawerSwipeDisabled(false);
			};
		}, [setDrawerSwipeDisabled, index])
	);
	const drawerGesture = useContext(DrawerGestureContext) ?? Gesture.Native();

	const nativeGesture =
		Gesture.Native().requireExternalGestureToFail(drawerGesture);
	return (
		<GestureDetector gesture={nativeGesture}>
			<TabView {...rest} />
		</GestureDetector>
	);
}
