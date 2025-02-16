import { useWindowDimensions, View } from 'react-native';
import { ModalsContainer } from '../com/modals/Modal';
import { Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import {
	useIsDrawerOpen,
	useSetDrawerOpen,
	useIsDrawerSwipeDisabled,
	useSetDrawerSwipeDisabled,
} from '~/state/shell';
import { useCallback, useState } from 'react';
import { Drawer } from 'react-native-drawer-layout';
import { isIOS } from '~/platform/detection';
import { DrawerContent } from './Drawer';
import { router } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

function ShellInner({ children }: React.PropsWithChildren<{}>) {
	const isDrawerOpen = useIsDrawerOpen();
	const { sessionId } = useAuth();
	const setIsDrawerOpen = useSetDrawerOpen();
	const isDrawerSwipeDisabled = useIsDrawerSwipeDisabled();

	const onOpenDrawer = useCallback(() => {
		setIsDrawerOpen(true);
	}, [setIsDrawerOpen]);
	const onCloseDrawer = useCallback(() => {
		setIsDrawerOpen(false);
	}, [setIsDrawerOpen]);
	const winDim = useWindowDimensions();
	const renderDrawerContent = useCallback(() => {
		return <DrawerContent />;
	}, []);
	const [trendingScrollGesture] = useState(() => Gesture.Native());
	const swipeEnabled =
		!router.canGoBack() && sessionId && !isDrawerSwipeDisabled;

	return (
		<>
			<Drawer
				renderDrawerContent={renderDrawerContent}
				drawerStyle={{ width: Math.min(400, winDim.width * 0.8) }}
				configureGestureHandler={handler => {
					handler = handler.requireExternalGestureToFail(trendingScrollGesture);
					if (swipeEnabled) {
						if (isDrawerOpen) {
							return handler.activeOffsetX([-1, 1]);
						} else {
							return (
								handler
									// Any movement to the left is a pager swipe
									// so fail the drawer gesture immediately.
									.failOffsetX(-1)
									// Don't rush declaring that a movement to the right
									// is a drawer swipe. It could be a vertical scroll.
									.activeOffsetX(5)
							);
						}
					} else {
						return handler.failOffsetX([0, 0]).failOffsetY([0, 0]);
					}
				}}
				open={isDrawerOpen}
				onOpen={onOpenDrawer}
				onClose={onCloseDrawer}
				swipeEdgeWidth={winDim.width}
				swipeMinVelocity={100}
				swipeMinDistance={10}
				drawerType={isIOS ? 'slide' : 'front'}
			>
				{children}
			</Drawer>
			<ModalsContainer />
		</>
	);
}
export function Shell({ children }: React.PropsWithChildren<{}>) {
	return (
		<View className="h-full">
			<ShellInner>{children}</ShellInner>
		</View>
	);
}
