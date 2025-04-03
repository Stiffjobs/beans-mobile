import React, { useCallback, useImperativeHandle, useState } from 'react';
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
import { cn } from '~/lib/utils';
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
	[BottomSheetSnapPoint.Comments]: ['10%', '100%'],
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
	hideBackdrop = false,
	onAnimte,
	addShadow = false,
	snapPoints = BottomSheetSnapPoint.Partial,
	containsList = false,
}: React.PropsWithChildren<DialogOuterProps>) {
	const ref = React.useRef<BottomSheetModal>(null);
	const { setDialogIsOpen } = useDialogStateControlContext();
	const closeCallbacks = React.useRef<(() => void)[]>([]);
	const [disableDrag, setDisableDrag] = React.useState(false);
	const [index, setIndex] = React.useState(0);

	const handleIndexChange = React.useCallback(
		(index: number) => {
			// If index is -1 (attempting to close) and we're in Comments mode
			// Force snap back to the minimum height (index 0)
			if (index === -1 && snapPoints === BottomSheetSnapPoint.Comments) {
				ref.current?.snapToIndex(0);
				return;
			}
			setIndex(index);
		},
		[snapPoints]
	);

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
	const toIndex = React.useCallback<DialogControlProps['toIndex']>(
		(index: number) => {
			ref.current?.snapToIndex(index);
		},
		[]
	);
	useImperativeHandle(
		control.ref,
		() => ({
			open,
			close,
			toIndex,
		}),
		[open, close, toIndex]
	);

	const context = React.useMemo(
		() => ({
			close,
			isNativeDialog: true,
			disableDrag,
			setDisableDrag,
			index,
			snapPoints,
		}),
		[close, disableDrag, setDisableDrag, index, snapPoints]
	);
	const reduceMotion = useReducedMotion();
	const insets = useSafeAreaInsets();
	const enableDismissOnClose = snapPoints !== BottomSheetSnapPoint.Comments;

	const renderHandle = useCallback(
		(props: BottomSheetHandleProps) => <Handle {...props} />,
		[]
	);
	const shadowStyle = addShadow
		? {
				shadowColor: '#000',
				shadowOffset: {
					width: 0,
					height: 5,
				},
				shadowOpacity: 0.34,
				shadowRadius: 6.27,

				elevation: 10,
			}
		: {};

	return (
		<NativewindModal
			backdropComponent={hideBackdrop ? null : Backdrop}
			style={shadowStyle}
			handleComponent={renderHandle}
			animateOnMount={!reduceMotion}
			keyboardBehavior="interactive"
			topInset={insets.top}
			enableDismissOnClose={enableDismissOnClose}
			enableOverDrag={false}
			keyboardBlurBehavior="restore"
			containerComponent={renderContainerComponent}
			backgroundClassName="bg-background"
			android_keyboardInputMode="adjustPan"
			enableDynamicSizing={false}
			onAnimate={onAnimte}
			ref={ref}
			onChange={handleIndexChange}
			overDragResistanceFactor={containsList ? 0 : 2.5}
			snapPoints={SNAPPOINTS[snapPoints]}
		>
			<Context.Provider value={context}>{children}</Context.Provider>
		</NativewindModal>
	);
}

export function Inner({ children, className }: DialogInnerProps) {
	return (
		<BottomSheetView className={cn('bg-background px-4 flex-1', className)}>
			{children}
		</BottomSheetView>
	);
}
export function ScrollableInner({ children }: DialogInnerProps) {
	return (
		<BottomSheetScrollView
			contentContainerClassName={'px-4'}
			className={'bg-background'}
		>
			{children}
		</BottomSheetScrollView>
	);
}

export function Handle(props: BottomSheetHandleProps) {
	return (
		<View className="rounded-t-2xl w-full items-center z-10 bg-background py-2">
			<View className="rounded-sm w-9 h-1 self-center bg-gray-500 dark:bg-gray-400 opacity-50" />
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
