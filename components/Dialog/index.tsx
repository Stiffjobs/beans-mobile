import React, { useCallback, useImperativeHandle } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
	DialogControlProps,
	DialogInnerProps,
	DialogOuterProps,
} from '~/components/Dialog/types';
import {
	BottomSheetBackdrop,
	BottomSheetModal,
	BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useDialogStateControlContext } from '~/state/dialogs';
import { Context, useDialogContext } from './context';
import { FullWindowOverlay } from 'react-native-screens';
export {
	useDialogContext,
	useDialogControl,
} from '~/components/Dialog/context';
export * from '~/components/Dialog/types';
export * from '~/components/Dialog/utils';
const SNAPPOINTS = ['50%'];
export function Outer({
	children,
	control,
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

	return (
		<BottomSheetModal
			backdropComponent={Backdrop}
			keyboardBehavior="interactive"
			keyboardBlurBehavior="restore"
			containerComponent={renderContainerComponent}
			android_keyboardInputMode="adjustPan"
			enableDynamicSizing={false}
			ref={ref}
			snapPoints={SNAPPOINTS}
		>
			<Context.Provider value={context}>
				<BottomSheetView className="relative">{children}</BottomSheetView>
			</Context.Provider>
		</BottomSheetModal>
	);
}

export function Inner({ children, style, header }: DialogInnerProps) {
	const insets = useSafeAreaInsets();
	return (
		<>
			{header}
			<View
				className="pt-6 px-5"
				style={[
					{
						paddingBottom: insets.bottom + insets.top,
					},
					style,
				]}
			>
				{children}
			</View>
		</>
	);
}

export function Handle() {
	const { close } = useDialogContext();
	return (
		<View className="absolute w-full items-center z-10 h-3">
			<Pressable onPress={() => close()}>
				<View className="rounded-sm w-9 h-1 self-center opacity-50" />
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
