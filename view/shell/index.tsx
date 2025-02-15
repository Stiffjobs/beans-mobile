import { useWindowDimensions, View } from 'react-native';
import { ModalsContainer } from '../com/modals/Modal';
import { Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useIsDrawerOpen, useSetDrawerOpen } from '~/state/shell/drawer-open';
import { useCallback, useState } from 'react';
import { Drawer } from 'react-native-drawer-layout';
import { isAndroid, isIOS } from '~/platform/detection';
import { DrawerContent } from './Drawer';
import { useColorScheme } from '~/lib/useColorScheme';

function ShellInner({ children }: React.PropsWithChildren<{}>) {
	const isDrawerOpen = useIsDrawerOpen();
	const setIsDrawerOpen = useSetDrawerOpen();
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
	const { isDarkColorScheme } = useColorScheme();

	return (
		<>
			<Drawer
				renderDrawerContent={renderDrawerContent}
				drawerStyle={{ width: Math.min(400, winDim.width * 0.8) }}
				configureGestureHandler={handler => {
					handler = handler.requireExternalGestureToFail(trendingScrollGesture);
					if (true) {
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
