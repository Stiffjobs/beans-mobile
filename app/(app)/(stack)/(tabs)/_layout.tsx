import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { Hamburger } from '~/view/com/util/Hamburger';
import { CoffeeBean, DoubleBeans } from '~/view/com/icons/SvgIcons';
import { TabBarAnimatedIcon } from '~/view/com/icons/StyledIcons';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
	name: React.ComponentProps<typeof FontAwesome>['name'];
	color: string;
}) {
	return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
	const colorScheme = useColorScheme();

	return (
		<Tabs
			initialRouteName="home"
			screenOptions={{
				tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
				// Disable the static render of the header on web
				// to prevent a hydration error in React Navigation v6.
				headerShown: useClientOnlyValue(false, true),
				headerShadowVisible: false,
				headerLeft: () => <Hamburger />,
				tabBarShowLabel: false,
			}}
		>
			<Tabs.Screen
				name="home"
				options={{
					title: 'Home',
					headerTitle: () => <CoffeeBean className="w-8 h-8" />,
					tabBarIcon: ({ color, focused }) => (
						<TabBarAnimatedIcon name="House" color={color} focused={focused} />
					),
				}}
			/>
			<Tabs.Screen
				name="beans"
				options={{
					title: 'Beans',
					tabBarIcon: ({ color, focused }) => (
						<DoubleBeans
							animated
							className="size-10"
							color={color}
							focused={focused}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="gears"
				options={{
					title: 'Gears',
					tabBarIcon: ({ color, focused }) => (
						<TabBarAnimatedIcon
							name="Warehouse"
							color={color}
							focused={focused}
						/>
					),
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: 'Profile',
					tabBarIcon: ({ color, focused }) => (
						<TabBarAnimatedIcon
							name="CircleUserRound"
							focused={focused}
							color={color}
						/>
					),
				}}
			/>
		</Tabs>
	);
}
