import { cssInterop } from 'nativewind';
import { TabBar } from 'react-native-tab-view';

export const CustomTabBar = cssInterop(TabBar, {
	className: {
		target: 'style',
	},
	indicatorClassName: {
		target: 'indicatorStyle',
	},
	indicatorContainerClassName: {
		target: 'indicatorContainerStyle',
	},
	activeClassName: {
		target: 'activeColor', //existing props
		nativeStyleToProp: {
			color: 'activeColor', //existing props
		},
	},
	inactiveClassName: {
		target: 'inactiveColor',
		nativeStyleToProp: {
			color: 'inactiveColor',
		},
	},
});
