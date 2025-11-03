import I18nKey from "../i18n/i18nKey";
import { i18n } from "../i18n/translation";
import { LinkPreset, type NavBarLink } from "../types/config";

export const LinkPresets: { [key in LinkPreset]: NavBarLink } = {
	[LinkPreset.Home]: {
		name: i18n(I18nKey.home),
		url: "/",
	},
	[LinkPreset.About]: {
		name: i18n(I18nKey.about),
		url: "/about/",
	},
	[LinkPreset.Archive]: {
		name: i18n(I18nKey.archive),
		url: "/archive/",
	},
	[LinkPreset.knowledge]: {
		name: i18n(I18nKey.knowledge),
		url: "/knowledge/",
	},
	[LinkPreset.me]: {
		name: i18n(I18nKey.me),
		url: "/me/",
	},
	[LinkPreset.friend]: {
		name: i18n(I18nKey.friend),
		url: "/friend/",
	},
	[LinkPreset.traing]: {
		name: i18n(I18nKey.traing),
		url: "/traing/",
	},
	[LinkPreset.chspif]: {
		name: i18n(I18nKey.chspif),
		url: "/chspif/",
	},
	[LinkPreset.crowdfunding]: {
		name: i18n(I18nKey.crowdfunding),
		url: "/crowdfunding/",
	},
	[LinkPreset.project]: {
		name: i18n(I18nKey.project),
		url: "/project/",
	},
};
