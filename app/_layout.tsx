import '../global.css';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
	DarkTheme,
	DefaultTheme,
	Theme,
	ThemeProvider,
} from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useCallback, useEffect, useState } from 'react';
import 'react-native-reanimated';
import '../global.css';
import { useColorScheme } from '~/lib/useColorScheme';
import { View } from 'react-native';
import * as Updates from 'expo-updates';
import * as Notifications from 'expo-notifications';

import { Provider as ModalProvider } from '@/state/modals';
import { Provider as DialogStateProvider } from '~/state/dialogs';
import { Provider as ShellStateProvider } from '@/state/shell';
import { NAV_THEME } from '~/lib/constants';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Platform } from 'react-native';
import { verifyInstallation } from 'nativewind';
import { PortalHost } from '@rn-primitives/portal';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo';
import { ConvexReactClient } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ConvexQueryClient } from '@convex-dev/react-query';
import { RootSiblingParent } from 'react-native-root-siblings';
import { ActionSheetProvider } from '@expo/react-native-action-sheet';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import { tokenCache } from '~/utils/cache';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Shell } from '~/view/shell';
import { I18nProvider } from '~/utils/i18nProvider';
import { PushNotificationManager } from '~/components/PushNotificationManager';
const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;
const convex = new ConvexReactClient(
	process.env.EXPO_PUBLIC_CONVEX_URL as string,
);
const convexQueryClient = new ConvexQueryClient(convex);
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			queryKeyHashFn: convexQueryClient.hashFn(),
			queryFn: convexQueryClient.queryFn(),
		},
	},
});

convexQueryClient.connect(queryClient);

if (!publishableKey) {
	throw new Error(
		'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env',
	);
}
export {
	// Catch any errors thrown by the Layout component.
	ErrorBoundary,
} from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldPlaySound: false,
		shouldSetBadge: false,
		shouldShowAlert: false,
	}),
});
const LIGHT_THEME: Theme = {
	...DefaultTheme,
	colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
	...DarkTheme,
	colors: NAV_THEME.dark,
};
export default function RootLayout() {
	const [appIsReady, setAppIsReady] = useState(false);
	const [loaded, error] = useFonts({
		SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
		...FontAwesome.font,
	});
	const { isUpdatePending } = Updates.useUpdates();

	useEffect(() => {
		if (isUpdatePending) {
			Updates.reloadAsync();
		}
	}, [isUpdatePending]);
	async function onFetchUpdateAsync() {
		try {
			if (process.env.NODE_ENV !== 'development') {
				const update = await Updates.checkForUpdateAsync();
				if (update.isAvailable) {
					await Updates.fetchUpdateAsync();
				}
			}
		} catch (error) {
			alert(`Error fetching update: ${error}`);
		} finally {
			setAppIsReady(true);
		}
	}

	// Expo Router uses Error Boundaries to catch errors in the navigation tree.
	useEffect(() => {
		if (error) throw error;
	}, [error]);

	useEffect(() => {
		if (loaded) {
			onFetchUpdateAsync();
		}
	}, [loaded]);

	const onLayoutRootView = useCallback(async () => {
		if (appIsReady) {
			await SplashScreen.hideAsync();
		}
	}, [appIsReady]);

	if (!loaded || !appIsReady) {
		return null;
	}
	return <RootLayoutNav onLayoutRootView={onLayoutRootView} />;
}
const useIsomorphicLayoutEffect =
	Platform.OS === 'web' && typeof window === 'undefined'
		? React.useEffect
		: React.useLayoutEffect;
function RootLayoutNav({
	onLayoutRootView,
}: {
	onLayoutRootView: () => Promise<void>;
}) {
	const hasMounted = React.useRef(false);
	const { isDarkColorScheme } = useColorScheme();
	const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);

	useIsomorphicLayoutEffect(() => {
		if (hasMounted.current) {
			return;
		}

		if (Platform.OS === 'web') {
			// Adds the background color to the html element to prevent white background on overscroll.
			document.documentElement.classList.add('bg-background');
		}
		setIsColorSchemeLoaded(true);
		hasMounted.current = true;
	}, []);
	if (!isColorSchemeLoaded) {
		return null;
	}
	verifyInstallation();

	return (
		<ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
			<ClerkLoaded>
				<RootSiblingParent>
					<I18nProvider>
						<ConvexProviderWithClerk client={convex} useAuth={useAuth}>
							<QueryClientProvider client={queryClient}>
								<GestureHandlerRootView style={{ flex: 1 }}>
									<KeyboardProvider>
										<ThemeProvider
											value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}
										>
											<ActionSheetProvider>
												<ShellStateProvider>
													<ModalProvider>
														<BottomSheetModalProvider>
															<DialogStateProvider>
																<View
																	onLayout={onLayoutRootView}
																	className="flex-1"
																>
																	<Shell>
																		<Slot />
																	</Shell>
																	<PortalHost />
																</View>
															</DialogStateProvider>
														</BottomSheetModalProvider>
													</ModalProvider>
												</ShellStateProvider>
											</ActionSheetProvider>
										</ThemeProvider>
									</KeyboardProvider>
								</GestureHandlerRootView>
							</QueryClientProvider>
							<PushNotificationManager />
						</ConvexProviderWithClerk>
					</I18nProvider>
				</RootSiblingParent>
			</ClerkLoaded>
		</ClerkProvider>
	);
}
