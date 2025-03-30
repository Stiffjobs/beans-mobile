import { GEAR_TYPE, RoastLevelEnum } from '~/lib/constants';
import { t } from '@lingui/core/macro';
export function getRoastLevelOptions() {
	return [
		{ label: t`Extra Light`, value: RoastLevelEnum.ExtraLight },
		{ label: t`Light`, value: RoastLevelEnum.Light },
		{ label: t`Medium Light`, value: RoastLevelEnum.MediumLight },
		{ label: t`Medium`, value: RoastLevelEnum.Medium },
		{ label: t`Medium Dark`, value: RoastLevelEnum.MediumDark },
		{ label: t`Dark`, value: RoastLevelEnum.Dark },
	];
}

export function getGearTypeOptions() {
	return [
		{ label: t`Grinder`, value: GEAR_TYPE.Grinder },
		{ label: t`Brewer`, value: GEAR_TYPE.Brewer },
		{ label: t`Filter Paper`, value: GEAR_TYPE['Filter paper'] },
	];
}
