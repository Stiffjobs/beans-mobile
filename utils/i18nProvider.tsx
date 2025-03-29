import { I18nProvider as LinguiI18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core';
import { messages } from '~/locales/en/messages';
import { messages as zhMessages } from '~/locales/zh-TW/messages';

i18n.loadAndActivate({
	locale: 'en',
	messages,
});
export function I18nProvider({ children }: { children: React.ReactNode }) {
	return <LinguiI18nProvider i18n={i18n}>{children}</LinguiI18nProvider>;
}
