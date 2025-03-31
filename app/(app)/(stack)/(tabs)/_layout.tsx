import React from 'react';
import { Tabs } from 'expo-router';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { Hamburger } from '~/view/com/util/Hamburger';
import { AnimatedBeans, CoffeeBean } from '~/view/com/icons/SvgIcons';
import { TabBarAnimatedIcon } from '~/view/com/icons/StyledIcons';
import { t } from '@lingui/core/macro';

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
					title: t`Home`,
					headerTitle: () => <CoffeeBean className="w-8 h-8" />,
					tabBarIcon: ({ color, focused }) => (
						<TabBarAnimatedIcon name="House" color={color} focused={focused} />
					),
				}}
			/>
			<Tabs.Screen
				name="beans"
				options={{
					title: t`Beans`,
					tabBarIcon: ({ color, focused }) => (
						<AnimatedBeans color={color} focused={focused} />
					),
				}}
			/>
			<Tabs.Screen
				name="gears"
				options={{
					title: t`Gears`,
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
					title: t`Profile`,
					headerTitleAlign: 'left',
					headerTitleStyle: {
						fontSize: 24,
						fontWeight: '600',
					},
					headerLeft: undefined,
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
