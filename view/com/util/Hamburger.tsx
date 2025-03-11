import { Button } from '~/components/ui/button';
import { useSetDrawerOpen } from '~/state/shell/drawer-open';
import { StyledIcon } from '../icons/StyledIcons';

export function Hamburger() {
	const setIsDrawerOpen = useSetDrawerOpen();
	return (
		<Button
			variant={'ghost'}
			size={'icon'}
			onPress={() => setIsDrawerOpen(true)}
		>
			<StyledIcon name="Menu" className="text-primary/50" />
		</Button>
	);
}
