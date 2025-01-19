import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

import { ExternalLink } from './ExternalLink';
import { Label } from './ui/label';
import { Code, H1, H2, H3, H4 } from './ui/typography';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { Badge } from './ui/badge';

export default function EditScreenInfo({ path }: { path: string }) {
	return (
		<View>
			<View style={styles.helpContainer}>
				<H1 className="text-red-600">Hello this is H1</H1>
				<H2>Hello this is H2</H2>
				<H3>Hello this is H3</H3>
				<H4>Hello this is H4</H4>
				<Skeleton className="h-12 w-12 rounded-full" />

				<Badge variant={'destructive'}>
					<Text>Default</Text>
				</Badge>
				<Text style={styles.helpLinkText}>
					Tap here if your app doesn't automatically update after making changes
				</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	getStartedContainer: {
		alignItems: 'center',
		marginHorizontal: 50,
	},
	homeScreenFilename: {
		marginVertical: 7,
	},
	codeHighlightContainer: {
		borderRadius: 3,
		paddingHorizontal: 4,
	},
	getStartedText: {
		fontSize: 17,
		lineHeight: 24,
		textAlign: 'center',
	},
	helpContainer: {
		marginTop: 15,
		marginHorizontal: 20,
		alignItems: 'center',
	},
	helpLink: {
		paddingVertical: 15,
	},
	helpLinkText: {
		textAlign: 'center',
	},
});
