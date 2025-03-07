import React, { useCallback, useImperativeHandle } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
	BottomSheetSnapPoint,
	DialogControlProps,
	DialogInnerProps,
	DialogOuterProps,
} from '~/components/Dialog/types';
import {
	BottomSheetBackdrop,
	BottomSheetHandleProps,
	BottomSheetModal,
	BottomSheetScrollView,
	BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useDialogStateControlContext } from '~/state/dialogs';
import { Context, useDialogContext } from './context';
import { FullWindowOverlay } from 'react-native-screens';
import { useReducedMotion } from 'react-native-reanimated';
import { cssInterop } from 'nativewind';
import {
	useAnimatedStyle,
	interpolate,
	Extrapolate,
} from 'react-native-reanimated';
import { Animated } from 'react-native';
export {
	useDialogContext,
	useDialogControl,
} from '~/components/Dialog/context';
export * from '~/components/Dialog/types';
export * from '~/components/Dialog/utils';
const SNAPPOINTS = {
	[BottomSheetSnapPoint.Hidden]: ['0%'],
	[BottomSheetSnapPoint.Quarter]: ['30%'],
	[BottomSheetSnapPoint.Partial]: ['50%'],
	[BottomSheetSnapPoint.Full]: ['90%'],
};
let NativewindModal = cssInterop(BottomSheetModal, {
	backgroundClassName: {
		target: 'backgroundStyle',
	},
	className: {
		target: 'style',
	},
});
export function Outer({
	children,
	control,
	snapPoints = BottomSheetSnapPoint.Partial,
}: React.PropsWithChildren<DialogOuterProps>) {
	const ref = React.useRef<BottomSheetModal>(null);
	const { setDialogIsOpen } = useDialogStateControlContext();
	const closeCallbacks = React.useRef<(() => void)[]>([]);
	const [disableDrag, setDisableDrag] = React.useState(false);

	const callQueuedCallbacks = React.useCallback(() => {
		for (const cb of closeCallbacks.current) {
			try {
				cb();
			} catch (e: any) {
				console.error(e || 'Error running close callback');
			}
		}

		closeCallbacks.current = [];
	}, []);

	const open = useCallback(() => {
		callQueuedCallbacks();
		setDialogIsOpen(control.id, true);
		ref.current?.present();
	}, [callQueuedCallbacks, control.id, setDialogIsOpen]);

	const renderContainerComponent = useCallback(
		({ children }: { children?: React.ReactNode }) => (
			<FullWindowOverlay>{children}</FullWindowOverlay>
		),
		[]
	);
	const close = React.useCallback<DialogControlProps['close']>(
		(cb?: () => void) => {
			if (typeof cb === 'function') {
				closeCallbacks.current.push(cb);
			}
			ref.current?.dismiss();
		},
		[]
	);
	useImperativeHandle(
		control.ref,
		() => ({
			open,
			close,
		}),
		[open, close]
	);

	const context = React.useMemo(
		() => ({
			close,
			isNativeDialog: true,
			disableDrag,
			setDisableDrag,
		}),
		[close, disableDrag, setDisableDrag]
	);
	const reduceMotion = useReducedMotion();

	const renderHandle = useCallback(
		(props: BottomSheetHandleProps) => <Handle {...props} />,
		[]
	);

	return (
		<NativewindModal
			backdropComponent={Backdrop}
			handleComponent={renderHandle}
			animateOnMount={!reduceMotion}
			keyboardBehavior="interactive"
			keyboardBlurBehavior="restore"
			containerComponent={renderContainerComponent}
			backgroundClassName="bg-background"
			android_keyboardInputMode="adjustPan"
			enableDynamicSizing={false}
			ref={ref}
			snapPoints={SNAPPOINTS[snapPoints]}
		>
			<Context.Provider value={context}>
				<View className="bg-background">{children}</View>
			</Context.Provider>
		</NativewindModal>
	);
}

export function Inner({ children, style, header }: DialogInnerProps) {
	const insets = useSafeAreaInsets();
	return (
		<>
			{header}
			<BottomSheetView
				className="pt-6 px-5"
				style={[
					{
						paddingBottom: insets.bottom + insets.top,
					},
					style,
				]}
			>
				{children}
			</BottomSheetView>
		</>
	);
}

export function ScrollableInner({ children, style, header }: DialogInnerProps) {
	const insets = useSafeAreaInsets();
	return (
		<BottomSheetScrollView className={'bg-background'}>
			{children}
		</BottomSheetScrollView>
	);
}

export function Handle(props: BottomSheetHandleProps) {
	const { close } = useDialogContext();

	return (
		<View className="rounded-t-2xl w-full items-center z-10 bg-background py-2">
			<Pressable onPress={() => close()}>
				<View className="rounded-sm w-9 h-1 self-center bg-gray-500 dark:bg-gray-400 opacity-50" />
			</Pressable>
		</View>
	);
}

export function Close() {
	return null;
}

function Backdrop(props: any) {
	return (
		<BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={1} />
	);
}
