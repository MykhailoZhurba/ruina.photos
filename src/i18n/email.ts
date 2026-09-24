/**
 * The visitor's auto-reply, in each language. It is sent in the language of
 * the page the visitor booked from. The owner's notification stays in English.
 *
 * Written in the first person as Mykhailo, so Russian and Ukrainian use
 * masculine verb forms (рад / радий).
 */

import type { Locale } from './locales';

export type EmailStrings = {
	subject: string;
	hello: string;
	helloName: string;
	thanks: string;
	soFar: string;
	typeLabel: string;
	dateLabel: string;
	askIntro: string;
	qDate: string;
	qType: string;
	qPlace: string;
	qPeople: string;
	qMood: string;
	reply: string;
	signoff: string;
};

export const emailStrings: Record<Locale, EmailStrings> = {
	en: {
		subject: 'About your shoot — a few details',
		hello: 'Hello,',
		helloName: 'Hi {name},',
		thanks: 'Thank you for getting in touch about a shoot — I am glad you did.',
		soFar: 'Here is what I have so far:',
		typeLabel: 'Type of shoot',
		dateLabel: 'Preferred date',
		askIntro: 'To put together the right plan and a price, it would help to know:',
		qDate: 'What date (or rough window) do you have in mind?',
		qType: 'What kind of shoot is it?',
		qPlace: 'Where would you like to shoot, and roughly how long do you need?',
		qPeople: 'How many people will be in front of the camera?',
		qMood: 'Anything else about the look or mood you are after?',
		reply: 'Just reply to this email — no forms. I usually answer within a day or two.',
		signoff: 'Looking forward to hearing more,',
	},
	lv: {
		subject: 'Par jūsu fotosesiju — dažas detaļas',
		hello: 'Labdien!',
		helloName: 'Sveiki, {name}!',
		thanks: 'Paldies, ka sazinājāties par fotosesiju — priecājos par to.',
		soFar: 'Lūk, ko es jau zinu:',
		typeLabel: 'Fotosesijas veids',
		dateLabel: 'Vēlamais datums',
		askIntro: 'Lai sagatavotu piemērotu plānu un cenu, būtu noderīgi uzzināt:',
		qDate: 'Kādu datumu (vai aptuvenu laiku) jūs plānojat?',
		qType: 'Kāda veida fotosesija tā būs?',
		qPlace: 'Kur jūs vēlētos fotografēties un cik ilgi aptuveni?',
		qPeople: 'Cik cilvēku būs kadrā?',
		qMood: 'Vai ir vēl kādas vēlmes attiecībā uz stilu vai noskaņu?',
		reply:
			'Vienkārši atbildiet uz šo e-pastu — nekādu formu. Parasti atbildu dienas vai divu laikā.',
		signoff: 'Ar nepacietību gaidu jūsu atbildi,',
	},
	ru: {
		subject: 'О вашей съёмке — несколько деталей',
		hello: 'Здравствуйте!',
		helloName: 'Здравствуйте, {name}!',
		thanks: 'Спасибо, что написали насчёт съёмки — очень рад.',
		soFar: 'Вот что я уже знаю:',
		typeLabel: 'Тип съёмки',
		dateLabel: 'Желаемая дата',
		askIntro: 'Чтобы составить подходящий план и назвать цену, мне пригодится знать:',
		qDate: 'Какую дату (или примерный период) вы планируете?',
		qType: 'Какая это будет съёмка?',
		qPlace: 'Где вы хотите снимать и сколько примерно времени понадобится?',
		qPeople: 'Сколько человек будет в кадре?',
		qMood: 'Есть ли пожелания по стилю или настроению?',
		reply: 'Просто ответьте на это письмо — никаких форм. Обычно я отвечаю в течение дня-двух.',
		signoff: 'Жду вашего ответа,',
	},
	uk: {
		subject: 'Про вашу зйомку — кілька деталей',
		hello: 'Вітаю!',
		helloName: 'Вітаю, {name}!',
		thanks: 'Дякую, що написали щодо зйомки — дуже радий.',
		soFar: 'Ось що я вже знаю:',
		typeLabel: 'Тип зйомки',
		dateLabel: 'Бажана дата',
		askIntro: 'Щоб скласти відповідний план і назвати ціну, мені знадобиться знати:',
		qDate: 'Яку дату (або орієнтовний період) ви плануєте?',
		qType: 'Яка це буде зйомка?',
		qPlace: 'Де ви хочете знімати і скільки приблизно часу знадобиться?',
		qPeople: 'Скільки людей буде в кадрі?',
		qMood: 'Чи є побажання щодо стилю або настрою?',
		reply:
			'Просто дайте відповідь на цей лист — жодних форм. Зазвичай я відповідаю протягом дня-двох.',
		signoff: 'Чекаю на вашу відповідь,',
	},
};
