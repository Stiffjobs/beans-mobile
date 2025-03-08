import { useModalControls, useModals } from '~/state/modals';
import BottomSheet, {
	BottomSheetProps,
	WINDOW_WIDTH,
} from '@gorhom/bottom-sheet';
import { useEffect, useRef } from 'react';
import * as CreatePostModal from './CreatePostModal';
import * as EditProfileModal from './EditProfile';
import * as EditPostModal from './EditPostModal';
import { SafeAreaView, View, Modal } from 'react-native';
import { createCustomBackdrop } from '../util/BottomSheetCustomBackdrop';
import { useReducedMotion } from 'react-native-reanimated';
import React from 'react';

const DEFAULT_SNAPPOINTS = ['90%'];

export function ModalsContainer() {
	const { isModalActive, activeModals } = useModals();
	const { closeModal } = useModalControls();
	const bottomSheetRef = useRef<BottomSheet>(null);
	const activeModal = activeModals[activeModals.length - 1] || undefined;

	const onBottomSheetChange = async (snapPoint: number) => {
		if (snapPoint === -1) {
			closeModal();
		}
	};

	const onClose = () => {
		closeModal();
	};
	const reduceMotion = useReducedMotion();

	useEffect(() => {
		console.log('name', activeModal?.name);
		if (isModalActive) {
			bottomSheetRef.current?.snapToIndex(0);
			// bottomSheetRef.current?.present();
		} else {
			bottomSheetRef.current?.close();
		}
	}, [isModalActive, bottomSheetRef, activeModal?.name]);

	let snapPoints: (string | number)[] = DEFAULT_SNAPPOINTS;
	let element;
	if (activeModal?.name === 'create-post') {
		snapPoints = CreatePostModal.snapPoints;
		element = <CreatePostModal.Component {...activeModal} />;
	} else if (activeModal?.name === 'edit-post') {
		snapPoints = EditPostModal.snapPoints;
		element = <EditPostModal.Component {...activeModal} />;
	} else if (activeModal?.name === 'edit-profile') {
		snapPoints = EditProfileModal.snapPoints;
		element = <EditProfileModal.Component {...activeModal} />;
	} else {
		return null;
	}

	if (snapPoints[0] === 'fullscreen') {
		return (
			<Modal visible={isModalActive} animationType="slide">
				<SafeAreaView className="bg-background flex-1">{element}</SafeAreaView>
			</Modal>
		);
	}

	if (snapPoints[0] === 'form') {
		return (
			<Modal
				presentationStyle="formSheet"
				visible={isModalActive}
				animationType="slide"
			>
				<SafeAreaView className="bg-background flex-1">{element}</SafeAreaView>
			</Modal>
		);
	}

	return (
		<BottomSheet
			ref={bottomSheetRef}
			snapPoints={snapPoints}
			index={isModalActive ? 0 : -1}
			onChange={onBottomSheetChange}
			enablePanDownToClose
			keyboardBlurBehavior="restore"
			handleComponent={HandleComponent}
			backdropComponent={
				isModalActive ? createCustomBackdrop(onClose) : undefined
			}
			keyboardBehavior="interactive"
			android_keyboardInputMode="adjustPan"
			animateOnMount={!reduceMotion}
			enableDynamicSizing={false}
		>
			{element}
		</BottomSheet>
	);
}

function HandleComponent() {
	return (
		<View className="h-8 p-4 rounded-t-lg bg-primary-foreground">
			<View
				className="h-1 w-10 self-center rounded-lg bg-primary/75"
				style={{
					width: (7.5 * WINDOW_WIDTH) / 100,
				}}
			/>
		</View>
	);
}
