import Fuse from 'fuse.js';
import { BeanProfileProps } from '~/lib/types';
import { useListBeanProfiles } from '~/state/queries/bean_profiles';

export function searchBeanProfiles(
	filter: string = '',
	beanProfiles: BeanProfileProps[],
) {
	if (!beanProfiles) return [];
	if (beanProfiles.length === 0) return [];

	const fuse = new Fuse<BeanProfileProps>(beanProfiles, {
		shouldSort: true,
		threshold: 0.0,
		location: 0,
		distance: 100,
		minMatchCharLength: 1,
		// NOTE: origin would switch to country
		keys: ['roaster', 'process', 'variety', 'origin'],
	});

	const search = fuse.search(filter);
	if (filter.length === 0) {
		return beanProfiles;
	} else {
		return search.map((e) => e.item);
	}
}
