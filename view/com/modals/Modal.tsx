import { useModalControls, useModals } from '~/state/modals';
import BottomSheet, { WINDOW_WIDTH } from '@gorhom/bottom-sheet';
import { useCallback, useEffect, useRef } from 'react';
import * as CreatePostModal from './CreatePostModal';
import * as EditProfileModal from './EditProfile';
import * as EditPostModal from './EditPostModal';
import * as EditGearModal from './EditGearModal';
import * as CreateGearModal from './CreateGearModal';
import * as CreateBeanProfileModal from './CreateBeanProfileModal';
import * as EditBeanProfileModal from './EditBeanProfileModal';
import * as CommentListModal from './CommentListModal';
import * as CountryPickerModal from './CountryPickerModal';
import { SafeAreaView, View, Modal } from 'react-native';
import { createCustomBackdrop } from '../util/BottomSheetCustomBackdrop';
import { useReducedMotion } from 'react-native-reanimated';
import React from 'react';
import { BottomSheetProps } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const DEFAULT_SNAPPOINTS = ['90%'];

export type SheetOptions = Partial<BottomSheetProps> & {
	showBackdrop?: boolean;
	addShadow?: boolean;
};
export function ModalsContainer() {
	const { isModalActive, activeModals, progress, index } = useModals();
	const { closeModal, setIndex } = useModalControls();
	const bottomSheetRef = useRef<BottomSheet>(null);
	const activeModal = activeModals[activeModals.length - 1] || undefined;
	const insets = useSafeAreaInsets();

	const onBottomSheetChange = async (snapPoint: number) => {
		setIndex(snapPoint);
		if (snapPoint === -1) {
			console.log('here close inside -1');
			closeModal();
		}
	};

	// const onClose = () => {
	// 	console.log('onClose close');
	// 	closeModal();
	// };
	const reduceMotion = useReducedMotion();

	const onClose = useCallback(() => {
		closeModal();
	}, [closeModal]);

	useEffect(() => {
		console.log('name', activeModal?.name);
		if (isModalActive && snapPoints.length === 1) {
			bottomSheetRef.current?.snapToIndex(0);
		} else {
			bottomSheetRef.current?.close();
		}
	}, [isModalActive, bottomSheetRef, activeModal?.name]);
	const snapTo = (index: number) => {
		bottomSheetRef.current?.snapToIndex(index);
	};

	let snapPoints: (string | number)[] = DEFAULT_SNAPPOINTS;
	let options: SheetOptions = {
		showBackdrop: true,
		addShadow: false,
	};
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
	} else if (activeModal?.name === 'create-gear') {
		snapPoints = CreateGearModal.snapPoints;
		element = <CreateGearModal.Component />;
	} else if (activeModal?.name === 'edit-gear') {
		snapPoints = EditGearModal.snapPoints;
		element = <EditGearModal.Component {...activeModal} />;
	} else if (activeModal?.name === 'create-bean-profile') {
		snapPoints = CreateBeanProfileModal.snapPoints;
		element = <CreateBeanProfileModal.Component />;
	} else if (activeModal?.name === 'edit-bean-profile') {
		snapPoints = EditBeanProfileModal.snapPoints;
		element = <EditBeanProfileModal.Component {...activeModal} />;
	} else if (activeModal?.name === 'comment-list') {
		snapPoints = CommentListModal.snapPoints;
		options = CommentListModal.options;
		element = <CommentListModal.Component {...activeModal} snapTo={snapTo} />;
	} else if (activeModal?.name === 'country-picker') {
		snapPoints = CountryPickerModal.snapPoints;
		element = <CountryPickerModal.Component {...activeModal} />;
	} else {
		return null;
	}

	let backdropComponent = undefined;
	if (options.showBackdrop === false) {
		backdropComponent = undefined;
	} else if (isModalActive) {
		backdropComponent = createCustomBackdrop(onClose);
	}
	const shadowStyle = options.addShadow
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
			topInset={insets.top}
			enablePanDownToClose
			enableOverDrag={false}
			keyboardBlurBehavior="restore"
			handleComponent={HandleComponent}
			style={[shadowStyle]}
			backdropComponent={backdropComponent}
			keyboardBehavior="interactive"
			android_keyboardInputMode="adjustPan"
			animateOnMount={!reduceMotion}
			enableDynamicSizing={false}
			{...options}
		>
			{element}
		</BottomSheet>
	);
}

function HandleComponent() {
	return (
		<View className="h-8 p-4 rounded-t-xl bg-background">
			<View
				className="h-1 w-10 self-center rounded-lg bg-primary/75"
				style={{
					width: (7.5 * WINDOW_WIDTH) / 100,
				}}
			/>
		</View>
	);
}
