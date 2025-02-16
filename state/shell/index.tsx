import { Provider as DrawerOpenProvider } from './drawer-open';
import { Provider as DrawerSwipeDisabledProvider } from './drawer-swipe-disabled';

export { useIsDrawerOpen, useSetDrawerOpen } from './drawer-open';
export {
	useIsDrawerSwipeDisabled,
	useSetDrawerSwipeDisabled,
} from './drawer-swipe-disabled';

export function Provider({ children }: React.PropsWithChildren<{}>) {
	return (
		<DrawerOpenProvider>
			<DrawerSwipeDisabledProvider>{children}</DrawerSwipeDisabledProvider>
		</DrawerOpenProvider>
	);
}
