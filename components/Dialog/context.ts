import React from 'react';

import {
	BottomSheetSnapPoint,
	DialogContextProps,
	DialogControlRefProps,
	DialogOuterProps,
} from './types';
import { useDialogStateContext } from '~/state/dialogs';

export const Context = React.createContext<DialogContextProps>({
	close: () => {},
	isNativeDialog: false,
	disableDrag: false,
	setDisableDrag: () => {},
});

export function useDialogContext() {
	return React.useContext(Context);
}

/** 
INFO: returning a new object with methods every time it runs.
` without useMemo would create new object ref on every render.
 New object ref would cause unnecessary re-renders
**/
export function useDialogControl(): DialogOuterProps['control'] {
	const id = React.useId();
	const control = React.useRef<DialogControlRefProps>({
		open: () => {},
		close: () => {},
	});
	const { activeDialogs } = useDialogStateContext();

	React.useEffect(() => {
		activeDialogs.current.set(id, control);
		return () => {
			// eslint-disable-next-line react-hooks/exhaustive-deps
			activeDialogs.current.delete(id);
		};
	}, [id, activeDialogs]);
	return React.useMemo<DialogOuterProps['control']>(
		() => ({
			id,
			ref: control,
			open: () => {
				control.current.open();
			},
			close: cb => {
				control.current.close(cb);
			},
		}),
		[id, control]
	);
}
