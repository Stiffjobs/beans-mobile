import React, { useState } from 'react';
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

export type Modal =
	| CreatePostModal
	| EditProfileModal
	| EditPostModal
	| CreateGearModal
	| EditGearModal;

const ModalContext = React.createContext<{
	isModalActive: boolean;
	activeModals: Modal[];
}>({
	activeModals: [],
	isModalActive: false,
});

const ModalControlContext = React.createContext<{
	openModal: (modal: Modal) => void;
	closeModal: () => boolean;
	closeAllModals: () => boolean;
}>({
	openModal: () => {},
	closeModal: () => false,
	closeAllModals: () => false,
});

export function Provider({ children }: React.PropsWithChildren<{}>) {
	const [activeModals, setActiveModals] = useState<Modal[]>([]);
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
		}),
		[activeModals]
	);

	const methods = React.useMemo(
		() => ({
			openModal,
			closeModal,
			closeAllModals,
		}),
		[openModal, closeModal, closeAllModals]
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
