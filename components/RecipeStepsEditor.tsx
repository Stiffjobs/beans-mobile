import React from 'react';
import { formatRecipeTime, parseRecipeTime } from '~/lib/recipes/utils';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Text } from './ui/text';
import { FlatList, View } from 'react-native';
import { StyledIcon } from '~/view/com/icons/StyledIcons';

type RecipeStep = {
	timestamp: string;
	action: string;
	value: number;
};
interface RecipeStepsEditorProps {
	steps: RecipeStep[];
	setSteps: (...event: any[]) => void;
}
export function RecipeStepsEditor({ steps, setSteps }: RecipeStepsEditorProps) {
	const [currentTimestamp, setCurrentTimestamp] = React.useState<string>('');
	const [currentAction, setCurrentAction] = React.useState<string>('');
	const addRecipeStep = () => {
		const lastStep = steps[steps.length - 1];
		let newTimestamp = currentTimestamp;

		// Format input timestamp if needed
		if (!currentTimestamp.includes(':')) {
			newTimestamp = formatRecipeTime(parseInt(currentTimestamp));
		}

		if (lastStep) {
			// Parse the last timestamp and add current timestamp duration
			const lastTimeInSeconds = parseRecipeTime(lastStep.timestamp);
			const currentTimeInSeconds = parseRecipeTime(newTimestamp);
			newTimestamp = formatRecipeTime(lastTimeInSeconds + currentTimeInSeconds);
		}
		const newStep = {
			timestamp: newTimestamp,
			action: currentAction,
			value: parseInt(currentTimestamp),
		};
		console.log('new step', newStep);

		setSteps([...steps, newStep]);
		setCurrentTimestamp('');
		setCurrentAction('');
	};

	return (
		<>
			<Label>Recipe Steps</Label>
			<Input
				placeholder="seconds"
				value={currentTimestamp}
				keyboardType="numeric"
				onChangeText={setCurrentTimestamp}
			/>
			<Textarea
				placeholder="action"
				value={currentAction}
				onChangeText={setCurrentAction}
			/>
			<Button size={'sm'} variant={'outline'} onPress={addRecipeStep}>
				<Text>Add Step</Text>
			</Button>
			<FlatList
				data={steps}
				scrollEnabled={false}
				ItemSeparatorComponent={() => <View className="h-2" />}
				renderItem={({ item, index }) => (
					<View
						key={item.timestamp}
						className="flex-1 flex-row justify-between items-center"
					>
						<View className="flex-1 gap-1">
							<Text className="text-gray-500">{item.timestamp}</Text>
							<Text>{item.action}</Text>
						</View>
						<Button
							variant="ghost"
							size="sm"
							onPress={() => {
								const newSteps = steps.filter((_, i) => i !== index);
								setSteps(newSteps);
							}}
						>
							<StyledIcon
								name="Trash2"
								className="w-4 aspect-square color-red-500"
							/>
						</Button>
					</View>
				)}
			/>
		</>
	);
}
