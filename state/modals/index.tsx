import React, { useState } from 'react';
import { SharedValue, useSharedValue } from 'react-native-reanimated';
import { User } from '~/lib/auth/types';

export interface CreatePostModal {
	name: 'create-post';
	selectedDate: string;
}

export interface EditPostModal {
	name: 'edit-post';
	id: string;
}

export interface EditProfileModal {
	name: 'edit-profile';
	user: User;
}

export interface CreateGearModal {
	name: 'create-gear';
}

export interface EditGearModal {
	name: 'edit-gear';
	id: string;
}

export interface CreateBeanProfileModal {
	name: 'create-bean-profile';
}
export interface EditBeanProfileModal {
	name: 'edit-bean-profile';
	id: string;
}

export interface CommentListModal {
	name: 'comment-list';
	postId: string;
}

export type Modal =
	| CreatePostModal
	| EditProfileModal
	| EditPostModal
	| CreateGearModal
	| EditGearModal
	| CreateBeanProfileModal
	| EditBeanProfileModal
	| CommentListModal;
const ModalContext = React.createContext<{
	isModalActive: boolean;
	progress: SharedValue<number>;
	activeModals: Modal[];
	index: number;
}>({
	activeModals: [],
	isModalActive: false,
	// Don't call hooks in context default value
	progress: { value: 0 } as SharedValue<number>,
	index: 0,
});

const ModalControlContext = React.createContext<{
	openModal: (modal: Modal) => void;
	closeModal: () => boolean;
	closeAllModals: () => boolean;
	setIndex: (index: number) => void;
}>({
	openModal: () => {},
	closeModal: () => false,
	closeAllModals: () => false,
	setIndex: () => {},
});

export function Provider({ children }: React.PropsWithChildren<{}>) {
	const [activeModals, setActiveModals] = useState<Modal[]>([]);
	const progress = useSharedValue(0);
	const [index, setIndex] = useState(0);
	const openModal = React.useCallback((modal: Modal) => {
		setActiveModals(modals => [...modals, modal]);
	}, []);
	const closeModal = React.useCallback(() => {
		let wasActive = activeModals.length > 0;
		setActiveModals(modals => {
			return modals.slice(0, -1);
		});
		return wasActive;
	}, []);
	const closeAllModals = React.useCallback(() => {
		let wasActive = activeModals.length > 0;
		setActiveModals([]);
		return wasActive;
	}, []);

	const state = React.useMemo(
		() => ({
			isModalActive: activeModals.length > 0,
			activeModals,
			progress,
			index,
		}),
		[activeModals, progress, index]
	);

	const methods = React.useMemo(
		() => ({
			openModal,
			closeModal,
			closeAllModals,
			setIndex,
		}),
		[openModal, closeModal, closeAllModals, setIndex]
	);
	return (
		<ModalContext.Provider value={state}>
			<ModalControlContext.Provider value={methods}>
				{children}
			</ModalControlContext.Provider>
		</ModalContext.Provider>
	);
}
export function useModals() {
	return React.useContext(ModalContext);
}

export function useModalControls() {
	return React.useContext(ModalControlContext);
}
