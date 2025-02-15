import { Provider as DrawerOpenProvider } from './drawer-open';

export function Provider({ children }: React.PropsWithChildren<{}>) {
	return <DrawerOpenProvider>{children}</DrawerOpenProvider>;
}
