import React from 'react';
import { Platform } from 'react-native';
import { FullWindowOverlay } from 'react-native-screens';

export const WindowOverlay =
	Platform.OS === 'ios' ? FullWindowOverlay : React.Fragment;
