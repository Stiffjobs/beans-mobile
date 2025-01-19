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
import React, { useEffect } from 'react';
import 'react-native-reanimated';
import '../global.css';
import { useColorScheme } from '~/lib/useColorScheme';

import { Provider as ModalProvider } from '@/state/modals';
import { Provider as SessionProvider } from '@/state/session';
import QueryProvider from '@/providers/QueryProvider';
import { NAV_THEME } from '~/lib/constants';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ModalsContainer } from '~/view/com/modals/Modal';
import { Platform } from 'react-native';
import { verifyInstallation } from 'nativewind';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

export {
	// Catch any errors thrown by the Layout component.
	ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
	// Ensure that reloading on `/modal` keeps a back button present.
	initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
const LIGHT_THEME: Theme = {
	...DefaultTheme,
	colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
	...DarkTheme,
	colors: NAV_THEME.dark,
};
export default function RootLayout() {
	const [loaded, error] = useFonts({
		SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
		...FontAwesome.font,
	});

	// Expo Router uses Error Boundaries to catch errors in the navigation tree.
	useEffect(() => {
		if (error) throw error;
	}, [error]);

	useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync();
		}
	}, [loaded]);

	if (!loaded) {
		return null;
	}
	return <RootLayoutNav />;
}
const useIsomorphicLayoutEffect =
	Platform.OS === 'web' && typeof window === 'undefined'
		? React.useEffect
		: React.useLayoutEffect;
function RootLayoutNav() {
	const hasMounted = React.useRef(false);
	const { colorScheme, isDarkColorScheme } = useColorScheme();
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
		<SessionProvider>
			<QueryProvider>
				<GestureHandlerRootView style={{ flex: 1 }}>
					<ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
						<ModalProvider>
							{/* <BottomSheetModalProvider> */}
							<Slot />
							<ModalsContainer />
							{/* </BottomSheetModalProvider> */}
						</ModalProvider>
					</ThemeProvider>
				</GestureHandlerRootView>
			</QueryProvider>
		</SessionProvider>
	);
}
