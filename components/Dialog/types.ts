import React from 'react';
import type { GestureResponderEvent } from 'react-native';
import { ViewStyle } from 'react-native';
import { StyleProp } from 'react-native';

export enum BottomSheetSnapPoint {
	Hidden,
	Quarter,
	Partial,
	Full,
	Comments,
}
export type DialogControlRefProps = {
	open: (
		options?: DialogControlOpenOptions & Partial<GestureResponderEvent>
	) => void;
	toIndex: (index: number) => void;
	close: (callback?: () => void) => void;
};

export type DialogControlProps = DialogControlRefProps & {
	id: string;
	ref: React.RefObject<DialogControlRefProps>;
	isOpen?: boolean;
};

export interface DialogOuterProps {
	control: DialogControlProps;
	containsList?: boolean;
	addShadow?: boolean;
	hideBackdrop?: boolean;
	snapPoints?: BottomSheetSnapPoint;
	onClose?: () => void;
	onAnimte?: (fromIndex: number, toIndex: number) => void;
}

export interface DialogInnerProps {
	children: React.ReactNode;
	style?: ViewStyle;
	header?: React.ReactNode;
	className?: string;
}

export type DialogContextProps = {
	close: DialogControlProps['close'];
	isNativeDialog: boolean;
	disableDrag: boolean;
	setDisableDrag: React.Dispatch<React.SetStateAction<boolean>>;
	index: number;
	snapPoints: BottomSheetSnapPoint;
};

export type DialogControlOpenOptions = {
	/**
	 * NATIVE ONLY
	 *
	 * Optional index of the snap point to open the bottom sheet to. Defaults to
	 * 0, which is the first snap point (i.e. "open").
	 */
	index?: number;
};

type ViewStyleProp = {
	style?: StyleProp<ViewStyle>;
};
