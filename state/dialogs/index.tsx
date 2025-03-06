import React from 'react';
import { DialogControlRefProps } from '~/components/Dialog/types';
import { isWeb } from '~/platform/detection';
import { Provider as GlobalDialogsProvider } from '~/components/dialogs/Context';
import { useBottomSheetModal } from '@gorhom/bottom-sheet';

export * from '~/components/Dialog/types';
export * from '~/components/Dialog/utils';

interface IDialogContext {
	/**
	 * The currently active `useDialogControl` hooks.
	 */
	activeDialogs: React.MutableRefObject<
		Map<string, React.MutableRefObject<DialogControlRefProps>>
	>;
	/**
	 * The currently open dialogs, referenced by their IDs, generated from
	 * `useId`.
	 */
	openDialogs: React.MutableRefObject<Set<string>>;
}

interface IDialogControlContext {
	closeAllDialogs(): boolean;
	setDialogIsOpen(id: string, isOpen: boolean): void;
	/**
	 * The number of dialogs that are fully expanded. This is used to determine the backgground color of the status bar
	 * on iOS.
	 */
	fullyExpandedCount: number;
	setFullyExpandedCount: React.Dispatch<React.SetStateAction<number>>;
}

const DialogContext = React.createContext<IDialogContext>({} as IDialogContext);

const DialogControlContext = React.createContext<IDialogControlContext>(
	{} as IDialogControlContext
);

export function useDialogStateContext() {
	return React.useContext(DialogContext);
}

export function useDialogStateControlContext() {
	return React.useContext(DialogControlContext);
}

export function Provider({ children }: React.PropsWithChildren<{}>) {
	const [fullyExpandedCount, setFullyExpandedCount] = React.useState(0);
	const { dismiss, dismissAll } = useBottomSheetModal();

	const activeDialogs = React.useRef<
		Map<string, React.MutableRefObject<DialogControlRefProps>>
	>(new Map());
	const openDialogs = React.useRef<Set<string>>(new Set());

	const closeAllDialogs = React.useCallback(() => {
		if (isWeb) {
			openDialogs.current.forEach(id => {
				const dialog = activeDialogs.current.get(id);
				if (dialog) dialog.current.close();
			});

			return openDialogs.current.size > 0;
		} else {
			//TODO: Implement dismissAll
			dismissAll();
			return false;
		}
	}, []);

	const setDialogIsOpen = React.useCallback((id: string, isOpen: boolean) => {
		if (isOpen) {
			openDialogs.current.add(id);
		} else {
			openDialogs.current.delete(id);
		}
	}, []);

	const context = React.useMemo<IDialogContext>(
		() => ({
			activeDialogs,
			openDialogs,
		}),
		[activeDialogs, openDialogs]
	);
	const controls = React.useMemo(
		() => ({
			closeAllDialogs,
			setDialogIsOpen,
			fullyExpandedCount,
			setFullyExpandedCount,
		}),
		[
			closeAllDialogs,
			setDialogIsOpen,
			fullyExpandedCount,
			setFullyExpandedCount,
		]
	);

	return (
		<DialogContext.Provider value={context}>
			<DialogControlContext.Provider value={controls}>
				<GlobalDialogsProvider>{children}</GlobalDialogsProvider>
			</DialogControlContext.Provider>
		</DialogContext.Provider>
	);
}
