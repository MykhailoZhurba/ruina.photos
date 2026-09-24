/**
 * Search-result wording in every language.
 *
 * English is `siteConfig.seo` itself; the other languages mirror its shape, and
 * the `SiteSeo` type rejects a translation with a missing field. Keep titles
 * ≲ 60 characters and descriptions ≲ 155, as for English.
 *
 * The owner's name is kept in Latin script in every language, matching the
 * brand and the social handles. In Latvian it sits next to "fotogrāfs" rather
 * than being declined, since a Latin-spelled foreign name does not take Latvian
 * case endings cleanly.
 */

import siteConfig, { type SiteSeo } from '../../site.config.mjs';
import type { Locale } from './locales';

const contactEmail = siteConfig.seo.contactEmail;

const lv: SiteSeo = {
	tagline: 'Auto, portretu, aviācijas un ielu fotogrāfija Latvijā',
	contactEmail,
	home: {
		title: 'Ruina Photos – auto un portretu fotogrāfs Latvijā',
		description:
			'Fotogrāfa Mykhailo Zhurba portfolio: auto, portretu, aviācijas un ielu fotogrāfija Latvijā. Maksas fotosesijas – sazinieties, lai rezervētu.',
	},
	about: {
		title: 'Par Mykhailo Zhurba – fotogrāfs | Ruina Photos',
		description:
			'Mykhailo Zhurba – fotogrāfs aiz Ruina Photos: auto, portretu un aviācijas fotogrāfija. Uzziniet par darbu un to, kā rezervēt fotosesiju.',
	},
	privacy: {
		title: 'Privātums | Ruina Photos',
		description:
			'Kā Ruina Photos apstrādā jūsu datus: bez sīkdatnēm, analītikas un izsekošanas; pieteikumus izmanto tikai, lai atbildētu.',
	},
	gallery: {
		title: 'Auto, portretu un aviācijas fotogalerija | Ruina Photos',
		description:
			'Fotogalerija: automašīnas, portreti, aviācija aviošovos un ielu fotogrāfija. Filtrējiet pēc kategorijas. Fotogrāfs Mykhailo Zhurba.',
		heading: 'Fotogalerija',
		intro: 'Auto, portretu, aviācijas un ielu fotogrāfija. Fotogrāfs – Mykhailo Zhurba.',
	},
	collections: {
		automotive: {
			title: 'Auto un drifta fotogrāfija Latvijā | Ruina Photos',
			description:
				'Auto fotogrāfija: automašīnas, auto pasākumi un drifts. Fotogrāfs Mykhailo Zhurba – LatviaDrift mediju pārstāvis. Rezervējiet auto fotosesiju.',
			heading: 'Auto fotogrāfija',
			intro:
				'Automašīnas pasākumos un uz vietas, tostarp drifts, ko fotografēju kā LatviaDrift mediju pārstāvis. Piedāvāju maksas auto fotosesijas.',
		},
		portraits: {
			title: 'Portretu un kospleja fotogrāfija | Ruina Photos',
			description:
				'Portretu un kospleja fotogrāfija. Radoši portreti un maksas portretu fotosesijas Latvijā. Fotogrāfs Mykhailo Zhurba.',
			heading: 'Portretu fotogrāfija',
			intro:
				'Portreti un kospleja fotosesijas, kas notver mirkli. Piedāvāju maksas portretu fotosesijas.',
		},
		street: {
			title: 'Ielu un pilsētas fotogrāfija | Ruina Photos',
			description:
				'Ielu un pilsētas fotogrāfija: vecpilsētas ielas, arhitektūra un ikdienas mirkļi. Fotogrāfs Mykhailo Zhurba.',
			heading: 'Ielu fotogrāfija',
			intro: 'Vecpilsētas ielas, arhitektūra un pilsētas ikdienas mirkļi.',
		},
		aviation: {
			title: 'Aviācijas un aviošovu fotogrāfija | Ruina Photos',
			description:
				'Aviācijas fotogrāfija: iznīcinātāji un akrobātiskie lidojumi aviošovos. Fotogrāfs Mykhailo Zhurba.',
			heading: 'Aviācijas fotogrāfija',
			intro: 'Reaktīvās lidmašīnas un citi gaisa kuģi aviošovos.',
		},
	},
	categoryLabels: {
		automotive: 'Auto fotogrāfija',
		portraits: 'Portretu fotogrāfija',
		street: 'Ielu fotogrāfija',
		aviation: 'Aviācijas fotogrāfija',
	},
};

const ru: SiteSeo = {
	tagline: 'Автомобильная, портретная, авиационная и уличная фотография в Латвии',
	contactEmail,
	home: {
		title: 'Ruina Photos – автомобильный и портретный фотограф в Латвии',
		description:
			'Портфолио Mykhailo Zhurba: автомобильная, портретная, авиационная и уличная фотография в Латвии. Платные фотосессии — напишите, чтобы записаться.',
	},
	about: {
		title: 'Mykhailo Zhurba – фотограф | Ruina Photos',
		description:
			'Mykhailo Zhurba — фотограф Ruina Photos: автомобильная, портретная и авиационная фотография. О работе и о том, как записаться на съёмку.',
	},
	privacy: {
		title: 'Конфиденциальность | Ruina Photos',
		description:
			'Как Ruina Photos обращается с вашими данными: без cookie, аналитики и отслеживания; заявки используются только для ответа.',
	},
	gallery: {
		title: 'Фотогалерея: авто, портреты, авиация | Ruina Photos',
		description:
			'Фотогалерея Mykhailo Zhurba: автомобили, портреты, авиация на авиашоу и уличная фотография. Фильтр по категориям.',
		heading: 'Фотогалерея',
		intro:
			'Автомобильная, портретная, авиационная и уличная фотография. Фотограф — Mykhailo Zhurba.',
	},
	collections: {
		automotive: {
			title: 'Автомобильная и дрифт-фотография в Латвии | Ruina Photos',
			description:
				'Автомобильная фотография: машины, автособытия и дрифт. Фотограф Mykhailo Zhurba — медиа LatviaDrift. Запишитесь на автофотосессию в Латвии.',
			heading: 'Автомобильная фотография',
			intro:
				'Автомобили на мероприятиях и на локациях, в том числе дрифт — я снимаю его как медиа LatviaDrift. Провожу платные автофотосессии.',
		},
		portraits: {
			title: 'Портретная и косплей-фотография | Ruina Photos',
			description:
				'Портретная и косплей-фотография. Творческие портреты и платные портретные фотосессии в Латвии. Фотограф Mykhailo Zhurba.',
			heading: 'Портретная фотография',
			intro:
				'Портреты и косплей-съёмки, которые ловят момент. Провожу платные портретные фотосессии.',
		},
		street: {
			title: 'Уличная и городская фотография | Ruina Photos',
			description:
				'Уличная и городская фотография: улицы старого города, архитектура и повседневные моменты. Фотограф Mykhailo Zhurba.',
			heading: 'Уличная фотография',
			intro: 'Улицы старого города, архитектура и повседневные моменты городской жизни.',
		},
		aviation: {
			title: 'Авиационная фотография и авиашоу | Ruina Photos',
			description:
				'Авиационная фотография: истребители и пилотажные выступления на авиашоу. Фотограф Mykhailo Zhurba.',
			heading: 'Авиационная фотография',
			intro: 'Реактивные самолёты и другая техника на авиашоу.',
		},
	},
	categoryLabels: {
		automotive: 'Автомобильная фотография',
		portraits: 'Портретная фотография',
		street: 'Уличная фотография',
		aviation: 'Авиационная фотография',
	},
};

const uk: SiteSeo = {
	tagline: 'Автомобільна, портретна, авіаційна та вулична фотографія в Латвії',
	contactEmail,
	home: {
		title: 'Ruina Photos – автомобільний і портретний фотограф у Латвії',
		description:
			'Портфоліо Mykhailo Zhurba: автомобільна, портретна, авіаційна та вулична фотографія в Латвії. Платні фотосесії — напишіть, щоб записатися.',
	},
	about: {
		title: 'Mykhailo Zhurba – фотограф | Ruina Photos',
		description:
			'Mykhailo Zhurba — фотограф Ruina Photos: автомобільна, портретна й авіаційна фотографія. Про роботу і про те, як записатися на зйомку.',
	},
	privacy: {
		title: 'Конфіденційність | Ruina Photos',
		description:
			'Як Ruina Photos поводиться з вашими даними: без cookie, аналітики й відстеження; заявки використовуються лише для відповіді.',
	},
	gallery: {
		title: 'Фотогалерея: авто, портрети, авіація | Ruina Photos',
		description:
			'Фотогалерея Mykhailo Zhurba: автомобілі, портрети, авіація на авіашоу та вулична фотографія. Фільтр за категоріями.',
		heading: 'Фотогалерея',
		intro: 'Автомобільна, портретна, авіаційна та вулична фотографія. Фотограф — Mykhailo Zhurba.',
	},
	collections: {
		automotive: {
			title: 'Автомобільна та дрифт-фотографія в Латвії | Ruina Photos',
			description:
				'Автомобільна фотографія: машини, автоподії та дрифт. Фотограф Mykhailo Zhurba — медіа LatviaDrift. Запишіться на автофотосесію в Латвії.',
			heading: 'Автомобільна фотографія',
			intro:
				'Автомобілі на заходах і на локаціях, зокрема дрифт — я знімаю його як медіа LatviaDrift. Проводжу платні автофотосесії.',
		},
		portraits: {
			title: 'Портретна та косплей-фотографія | Ruina Photos',
			description:
				'Портретна та косплей-фотографія. Творчі портрети й платні портретні фотосесії в Латвії. Фотограф Mykhailo Zhurba.',
			heading: 'Портретна фотографія',
			intro: 'Портрети та косплей-зйомки, що ловлять мить. Проводжу платні портретні фотосесії.',
		},
		street: {
			title: 'Вулична та міська фотографія | Ruina Photos',
			description:
				'Вулична та міська фотографія: вулиці старого міста, архітектура й повсякденні моменти. Фотограф Mykhailo Zhurba.',
			heading: 'Вулична фотографія',
			intro: 'Вулиці старого міста, архітектура й повсякденні моменти міського життя.',
		},
		aviation: {
			title: 'Авіаційна фотографія та авіашоу | Ruina Photos',
			description:
				'Авіаційна фотографія: винищувачі та пілотажні виступи на авіашоу. Фотограф Mykhailo Zhurba.',
			heading: 'Авіаційна фотографія',
			intro: 'Реактивні літаки та інша техніка на авіашоу.',
		},
	},
	categoryLabels: {
		automotive: 'Автомобільна фотографія',
		portraits: 'Портретна фотографія',
		street: 'Вулична фотографія',
		aviation: 'Авіаційна фотографія',
	},
};

export const seoByLocale: Record<Locale, SiteSeo> = { en: siteConfig.seo, lv, ru, uk };

export function seoFor(locale: Locale): SiteSeo {
	return seoByLocale[locale] ?? siteConfig.seo;
}
