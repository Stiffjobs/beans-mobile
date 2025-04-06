import React from 'react';
import { TextInput, TextInputProps } from 'react-native';
import { cn } from '~/lib/utils';

const Input = React.forwardRef<
	React.ElementRef<typeof TextInput>,
	TextInputProps & { editableShowPrimary?: boolean; transparent?: boolean }
>(
	(
		{
			className,
			placeholderClassName,
			editableShowPrimary,
			transparent,
			...props
		},
		ref
	) => {
		return (
			<TextInput
				ref={ref}
				className={cn(
					'p-3 rounded-md border border-input bg-background  text-foreground',
					props.editable === false && !editableShowPrimary && 'opacity-50',
					transparent && 'bg-transparent border-0 p-0',
					className
				)}
				style={{
					fontSize: 16,
				}}
				placeholderClassName={cn('text-muted-foreground', placeholderClassName)}
				{...props}
			/>
		);
	}
);

export { Input };
