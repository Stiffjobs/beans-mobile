import { cssInterop } from 'nativewind';
import { TabBar } from 'react-native-tab-view';
import { BlockDrawerGesture } from '~/view/shell/BlockDrawerGesture';
import {
	NavigationState,
	Route,
	SceneRendererProps,
	TabDescriptor,
	TabView,
} from 'react-native-tab-view';

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

export const renderTabBar = (
	props: SceneRendererProps & {
		navigationState: NavigationState<Route>;
		options: Record<string, TabDescriptor<Route>> | undefined;
	}
) => {
	const { options, ...rest } = props;
	return (
		<BlockDrawerGesture>
			<CustomTabBar
				className="bg-background"
				tabStyle={{ width: 'auto' }}
				activeClassName="text-primary"
				inactiveClassName="text-primary/50"
				indicatorClassName="bg-primary/75"
				{...rest}
			/>
		</BlockDrawerGesture>
	);
};
