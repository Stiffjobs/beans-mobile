import { ScrollView, TouchableOpacity, View } from 'react-native';
import { useGetCurrentUser, useSignOut } from '~/state/queries/auth';
import { Text } from '~/components/ui/text';
import React, { useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { H3, H4 } from '~/components/ui/typography';
import { Separator } from '~/components/ui/separator';
import { StyledIcon } from '../com/icons/StyledIcons';
import { Link } from 'expo-router';
import { useSetDrawerOpen } from '~/state/shell/drawer-open';
import { UserAvatar } from '../com/util/UserAvatar';
import { TripleBeans } from '../com/icons/SvgIcons';
import { House, User, Warehouse } from '~/lib/icons';
let DrawerProfileCard = ({}): React.ReactNode => {
	const currentUser = useGetCurrentUser();
	return (
		<View className="gap-4">
			<UserAvatar avatar={currentUser?.data?.avatar} />
			<View>
				<H4>{currentUser?.data?.name}</H4>
			</View>
		</View>
	);
};

DrawerProfileCard = React.memo(DrawerProfileCard);
export { DrawerProfileCard };
export function DrawerContent() {
	const signOutMutation = useSignOut();
	const setIsDrawerOpen = useSetDrawerOpen();

	const handleSignOut = async () => {
		await signOutMutation.mutateAsync();
	};
	const { top, bottom } = useSafeAreaInsets();
	const onPressHome = useCallback(() => {
		setIsDrawerOpen(false);
	}, [setIsDrawerOpen]);
	const onPressProfile = useCallback(() => {
		setIsDrawerOpen(false);
	}, [setIsDrawerOpen]);

	const onPressGears = useCallback(() => {
		setIsDrawerOpen(false);
	}, [setIsDrawerOpen]);
	const onPressBeans = useCallback(() => {
		setIsDrawerOpen(false);
	}, [setIsDrawerOpen]);
	const onPressSignOut = useCallback(async () => {
		setIsDrawerOpen(false);
		await handleSignOut();
	}, [setIsDrawerOpen, handleSignOut]);

	return (
		<ScrollView
			className="bg-background"
			contentContainerStyle={{
				paddingTop: top + 20,
				paddingBottom: bottom,
			}}
			contentContainerClassName="flex-1 bg-background"
		>
			<View className="flex-1 flex px-2 flex-col justify-between">
				<View className="gap-2">
					<DrawerProfileCard />
					<Separator />
					<HomeMenuItem onPress={onPressHome} />
					<BeansMenuItem onPress={onPressBeans} />
					<GearsMenuItem onPress={onPressGears} />
					<ProfileMenuItem onPress={onPressProfile} />
				</View>
				<View>
					<Separator />
					<SignOutMenuItem onPress={onPressSignOut} />
				</View>
			</View>
		</ScrollView>
	);
}

interface MenuItemProps {
	icon: JSX.Element;
	label: string;
	onPress?: () => void;
	count?: string;
	bold?: boolean;
	variant?: 'default' | 'destructive';
}
const MenuItem = React.forwardRef<View, MenuItemProps>(
	({ icon, label, onPress, variant = 'default' }, ref) => {
		return (
			<TouchableOpacity
				ref={ref}
				onPress={onPress}
				className="flex-row"
				accessibilityRole="tab"
			>
				<View className=" flex-row items-center p-4 gap-2">
					{icon}
					<Text
						className={`text-xl ${variant === 'destructive' ? 'text-destructive' : 'text-primary'}`}
					>
						{label}
					</Text>
				</View>
			</TouchableOpacity>
		);
	}
);
let HomeMenuItem = ({ onPress }: { onPress?: () => void }): React.ReactNode => {
	return (
		<Link asChild href="/(app)/(stack)/(tabs)/home">
			<MenuItem
				icon={<House className="text-primary" />}
				label={'Home'}
				onPress={onPress}
			/>
		</Link>
	);
};
HomeMenuItem = React.memo(HomeMenuItem);

let GearsMenuItem = ({
	onPress,
}: {
	onPress?: () => void;
}): React.ReactNode => {
	return (
		<Link asChild href="/(app)/(stack)/(tabs)/gears">
			<MenuItem
				icon={<Warehouse className="text-primary" />}
				label={'Gears'}
				onPress={onPress}
			/>
		</Link>
	);
};

GearsMenuItem = React.memo(GearsMenuItem);

let ProfileMenuItem = ({
	onPress,
}: {
	onPress?: () => void;
}): React.ReactNode => {
	return (
		<Link asChild href="/(app)/(stack)/(tabs)/profile">
			<MenuItem
				icon={<User className="text-primary" />}
				label={'Profile'}
				onPress={onPress}
			/>
		</Link>
	);
};
HomeMenuItem = React.memo(HomeMenuItem);

let BeansMenuItem = ({
	onPress,
}: {
	onPress?: () => void;
}): React.ReactNode => {
	return (
		<Link href={'/(app)/(stack)/(tabs)/beans'} asChild>
			<MenuItem icon={<TripleBeans />} label={'Beans'} onPress={onPress} />
		</Link>
	);
};

export function SignOutMenuItem({ onPress }: { onPress: () => void }) {
	return (
		<Link asChild href={'/signin'}>
			<MenuItem
				icon={<StyledIcon className="text-destructive size-6" name="LogOut" />}
				label="Sign Out"
				onPress={onPress}
				variant="destructive"
			/>
		</Link>
	);
}
