import { useModalControls, useModals } from '~/state/modals';
import BottomSheet, {
	BottomSheetModal,
	BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useEffect, useRef } from 'react';
import * as CreatePostModal from './CreatePostModal';
import * as EditProfileModal from './EditProfileModal';
import { SafeAreaView, StyleSheet, View, Text } from 'react-native';
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
		element = <CreatePostModal.Component />;
	} else if (activeModal?.name === 'edit-profile') {
		snapPoints = EditProfileModal.snapPoints;
		element = <EditProfileModal.Component />;
	} else {
		return null;
	}

	if (snapPoints[0] === 'fullscreen') {
		return <SafeAreaView className="flex-1">{element}</SafeAreaView>;
	}

	return (
		<BottomSheet
			ref={bottomSheetRef}
			snapPoints={snapPoints}
			index={isModalActive ? 0 : -1}
			onChange={onBottomSheetChange}
			enablePanDownToClose
			keyboardBlurBehavior="restore"
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
