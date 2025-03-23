import React from 'react';
import { TextInput, TextInputProps } from 'react-native';
import { cn } from '~/lib/utils';

const Input = React.forwardRef<
	React.ElementRef<typeof TextInput>,
	TextInputProps & { editableShowPrimary?: boolean }
>(({ className, placeholderClassName, editableShowPrimary, ...props }, ref) => {
	return (
		<TextInput
			ref={ref}
			className={cn(
				'p-3 rounded-md border border-input bg-background  text-foreground placeholder:text-muted-foreground',
				props.editable === false && !editableShowPrimary && 'opacity-50',
				className
			)}
			style={{
				fontSize: 16,
			}}
			placeholderClassName={cn('text-muted-foreground', placeholderClassName)}
			{...props}
		/>
	);
});

export { Input };
