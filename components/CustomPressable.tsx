import { forwardRef, useRef } from 'react';
import {
	GestureResponderEvent,
	Pressable,
	PressableProps,
	View,
} from 'react-native';

interface CustomPressableProps extends PressableProps {
	children?: React.ReactNode;
}

const CustomPressable = forwardRef<View, CustomPressableProps>(
	({ onPress, onPressIn, onPressOut, children, ...props }, ref) => {
		const _touchActivatePositionRef = useRef<{
			pageX: number;
			pageY: number;
		} | null>(null);

		function _onPressIn(e: GestureResponderEvent) {
			const { pageX, pageY } = e.nativeEvent;

			_touchActivatePositionRef.current = {
				pageX,
				pageY,
			};

			onPressIn?.(e);
		}

		function _onPress(e: GestureResponderEvent) {
			const { pageX, pageY } = e.nativeEvent;

			if (!_touchActivatePositionRef.current) {
				return;
			}

			const absX = Math.abs(_touchActivatePositionRef.current.pageX - pageX);
			const absY = Math.abs(_touchActivatePositionRef.current.pageY - pageY);

			const dragged = absX > 2 || absY > 2;
			if (!dragged) {
				onPress?.(e);
			}
		}

		return (
			<Pressable
				ref={ref}
				onPressIn={_onPressIn}
				onPress={_onPress}
				onPressOut={onPressOut}
				{...props}
			>
				{children}
			</Pressable>
		);
	}
);

CustomPressable.displayName = 'CustomPressable';

export { CustomPressable };
