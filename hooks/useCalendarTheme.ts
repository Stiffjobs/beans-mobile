import { useColorScheme } from 'react-native';
import { useState, useEffect } from 'react';

const themes = {
	light: {
		calendarBackground: 'white',
		dayTextColor: 'black',
		monthTextColor: 'black',
		textDisabledColor: 'grey',
		selectedDayBackgroundColor: '#007AFF',
		selectedDayTextColor: 'white',
		todayTextColor: '#007AFF',
		dotColor: '#007AFF',
	},
	dark: {
		calendarBackground: 'black',
		dayTextColor: 'white',
		monthTextColor: 'white',
		textDisabledColor: 'grey',
		selectedDayBackgroundColor: '#0A84FF',
		selectedDayTextColor: 'white',
		todayTextColor: '#0A84FF',
		dotColor: '#0A84FF',
	},
} as const;

export function useCalendarTheme() {
	const colorScheme = useColorScheme();
	const [{ key, theme }, setTheme] = useState({
		key: colorScheme,
		theme: themes[colorScheme ?? 'light'],
	});

	useEffect(() => {
		setTheme({
			key: colorScheme,
			theme: themes[colorScheme ?? 'light'],
		});
	}, [colorScheme]);

	return { key, theme };
}
