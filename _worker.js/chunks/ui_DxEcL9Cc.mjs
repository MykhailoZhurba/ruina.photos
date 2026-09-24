globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createComponent, b as createAstro, m as maybeRenderHead, s as spreadAttributes, g as addAttribute, e as renderSlot, a as renderTemplate, r as renderComponent } from './astro/server_DAe86DXx.mjs';

const $$Astro$2 = createAstro("https://ruina.photos");
const $$ = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$;
  const size = Astro2.props.size;
  const cls = Astro2.props.class;
  const name = Astro2.props.iconName;
  delete Astro2.props.size;
  delete Astro2.props.class;
  delete Astro2.props.iconName;
  const props = Object.assign({
    "xmlns": "http://www.w3.org/2000/svg",
    "stroke-width": 2,
    "width": size ?? 24,
    "height": size ?? 24,
    "stroke": "currentColor",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
    "fill": "none",
    "viewBox": "0 0 24 24"
  }, Astro2.props);
  return renderTemplate`${maybeRenderHead()}<svg${spreadAttributes(props)}${addAttribute(["lucide", { [`lucide-${name}`]: name }, cls], "class:list")}> ${renderSlot($$result, $$slots["default"])} </svg>`;
}, "/home/runner/work/ruina.photos/ruina.photos/node_modules/lucide-astro/dist/.Layout.astro", void 0);

const $$Astro$1 = createAstro("https://ruina.photos");
const $$Facebook = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$Facebook;
  return renderTemplate`${renderComponent($$result, "Layout", $$, { "iconName": "facebook", ...Astro2.props }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path> ` })}`;
}, "/home/runner/work/ruina.photos/ruina.photos/node_modules/lucide-astro/dist/Facebook.astro", void 0);

const $$Astro = createAstro("https://ruina.photos");
const $$Instagram = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Instagram;
  return renderTemplate`${renderComponent($$result, "Layout", $$, { "iconName": "instagram", ...Astro2.props }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect> <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path> <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line> ` })}`;
}, "/home/runner/work/ruina.photos/ruina.photos/node_modules/lucide-astro/dist/Instagram.astro", void 0);

const seo = {
  tagline: "Automotive, portrait, aviation and street photography in Latvia",
  contactEmail: "",
  home: {
    title: "Ruina Photos – Automotive & Portrait Photographer in Latvia",
    description: "Portfolio of Mykhailo Zhurba: automotive, portrait, aviation and street photography in Latvia. Available for paid photoshoots – get in touch to book."
  },
  about: {
    title: "About Mykhailo Zhurba – Photographer | Ruina Photos",
    description: "Mykhailo Zhurba is the photographer behind Ruina Photos: automotive, portrait and aviation photography. Learn about the work and how to book a shoot."
  },
  privacy: {
    title: "Privacy | Ruina Photos",
    description: "How Ruina Photos handles your data: no cookies, analytics or tracking, and booking enquiries used only to reply."
  },
  gallery: {
    title: "Automotive, Portrait & Aviation Photo Gallery | Ruina Photos",
    description: "Browse the photography gallery of Mykhailo Zhurba: cars, portraits, airshow aviation and street photos. Filter by category.",
    heading: "Photography Gallery",
    intro: "Automotive, portrait, aviation and street photography by Mykhailo Zhurba."
  },
  collections: {
    automotive: {
      title: "Automotive & Drift Photography in Latvia | Ruina Photos",
      description: "Automotive photography by Mykhailo Zhurba, current media for LatviaDrift: cars, car events and drift. Book an automotive photoshoot in Latvia.",
      heading: "Automotive Photography",
      intro: "Cars photographed at events and on location, including drift coverage as current media for LatviaDrift. Available for paid automotive photoshoots."
    },
    portraits: {
      title: "Portrait & Cosplay Photography | Ruina Photos",
      description: "Portrait and cosplay photography by Mykhailo Zhurba. Browse creative portraits and book a paid portrait photoshoot in Latvia.",
      heading: "Portrait Photography",
      intro: "Portraits and cosplay shoots that capture the moment. Available for paid portrait photoshoots."
    },
    street: {
      title: "Street & City Photography | Ruina Photos",
      description: "Street and city photography by Mykhailo Zhurba: old-town streets, architecture and everyday moments.",
      heading: "Street Photography",
      intro: "Old-town streets, architecture and everyday moments from the city."
    },
    aviation: {
      title: "Aviation & Airshow Photography | Ruina Photos",
      description: "Aviation photography by Mykhailo Zhurba: fighter jets and aerobatic displays at airshows.",
      heading: "Aviation Photography",
      intro: "Jets and aircraft photographed at airshows."
    }
  },
  categoryLabels: {
    automotive: "Automotive photography",
    portraits: "Portrait photography",
    street: "Street photography",
    aviation: "Aviation photography"
  }
};
const siteConfig = {
  title: "Ruina Photos",
  /** Options offered in the booking popup's "type of shoot" dropdown. */
  shootTypes: ["Automotive", "Portrait", "Cosplay", "Event", "Street", "Something else"],
  favicon: "favicon.png",
  owner: "Mykhailo Zhurba",
  profileImage: "profile.webp",
  profileImageAlt: "Mykhailo Zhurba holding a telephoto camera lens at an airfield, with a light aircraft on the runway behind him",
  socialLinks: [
    {
      name: "Facebook",
      label: "Ruina Photos on Facebook",
      url: "https://www.facebook.com/ruina.photos/",
      icon: $$Facebook
    },
    {
      name: "Instagram",
      label: "Ruina Photos on Instagram",
      url: "https://www.instagram.com/ruina.photos/",
      icon: $$Instagram
    },
    {
      name: "Instagram (personal)",
      label: "Mykhailo Zhurba on Instagram",
      url: "https://www.instagram.com/mikelino1370/",
      icon: $$Instagram
    }
  ],
  seo
};

const LOCALES = ["en", "lv", "ru", "uk"];
const DEFAULT_LOCALE = "en";
const PREFIXED_LOCALES = LOCALES.filter((locale) => locale !== DEFAULT_LOCALE);
const LOCALE_META = {
  en: { short: "EN", name: "English", ogLocale: "en_US" },
  lv: { short: "LV", name: "Latviešu", ogLocale: "lv_LV" },
  ru: { short: "RU", name: "Русский", ogLocale: "ru_RU" },
  // "uk" is the ISO 639-1 code for Ukrainian, and what hreflang and <html lang>
  // require. "UA" is what Ukrainian readers recognise in a language switcher.
  uk: { short: "UA", name: "Українська", ogLocale: "uk_UA" }
};
function isLocale(value) {
  return typeof value === "string" && LOCALES.includes(value);
}
function getLocale(url) {
  const pathname = typeof url === "string" ? url : url.pathname;
  const first = pathname.split("/")[1];
  return isLocale(first) && first !== DEFAULT_LOCALE ? first : DEFAULT_LOCALE;
}
function stripLocale(pathname) {
  const locale = getLocale(pathname);
  if (locale === DEFAULT_LOCALE) return pathname || "/";
  const rest = pathname.slice(locale.length + 1);
  return rest.startsWith("/") ? rest : `/${rest}`;
}
function localizePath(path, locale) {
  const bare = stripLocale(path.startsWith("/") ? path : `/${path}`);
  const withSlash = bare.endsWith("/") ? bare : `${bare}/`;
  return locale === DEFAULT_LOCALE ? withSlash : `/${locale}${withSlash}`;
}

const en = {
  // Navigation
  "nav.home": "Home",
  "nav.gallery": "Gallery",
  "nav.about": "About",
  "nav.book": "Book",
  "nav.bookLong": "Book a shoot",
  "nav.menu": "Menu",
  "nav.language": "Language",
  "theme.dark": "Dark mode",
  // Home page
  "hero.by": "by {owner}",
  "hero.viewGallery": "View Gallery",
  "hero.featuredWork": "Featured Work",
  "hero.scroll": "Scroll down to see featured work",
  "featured.heading": "Featured Works",
  "featured.intro": "A selection of my best photography",
  // Gallery
  "gallery.all": "All",
  "collection.automotive": "Automotive",
  "collection.portraits": "Portraits",
  "collection.street": "Street",
  "collection.aviation": "Aviation",
  "gallery.fallbackTitle": "{name} Photography | {site}",
  "gallery.fallbackHeading": "{name} Photography",
  "gallery.fallbackIntro": "{name} photography by {owner}.",
  "alt.photo": "{label} by {site}",
  "alt.number": "image {n}",
  "alt.default": "Photography",
  "seo.imageAlt": "{site} – photograph by {owner}",
  // Photo viewer
  "lightbox.close": "Close",
  "lightbox.zoom": "Zoom",
  "lightbox.prev": "Previous",
  "lightbox.next": "Next",
  "lightbox.error": "The image cannot be loaded",
  // About and privacy
  "about.heading": "About {owner}",
  "about.photoAlt": "Mykhailo Zhurba holding a telephoto camera lens at an airfield, with a light aircraft on the runway behind him",
  "about.email": "Email",
  "privacy.heading": "Privacy",
  // Footer
  "footer.rights": "All rights reserved.",
  "footer.privacy": "Privacy",
  "social.facebook": "Ruina Photos on Facebook",
  "social.instagram": "Ruina Photos on Instagram",
  "social.instagramPersonal": "Mykhailo Zhurba on Instagram",
  // Booking form
  "booking.closeForm": "Close booking form",
  "booking.title": "Book a shoot",
  "booking.intro": "Leave your email and I will write back with the details. Everything below the email is optional — fill in what you already know.",
  "booking.email": "Email",
  "booking.name": "Name",
  "booking.date": "Preferred date",
  "booking.type": "Type of shoot",
  "booking.typeUnsure": "Not sure yet",
  "booking.message": "Anything else?",
  "booking.messagePlaceholder": "Location, mood, how many people…",
  "booking.send": "Send enquiry",
  "booking.sending": "Sending…",
  "booking.note": "Your email is used only to reply about your shoot.",
  "booking.thanks": "Thank you",
  "booking.done": "Close",
  "booking.ok.sent": "Thank you — check your inbox, I have sent you a note.",
  "booking.ok.stored": "Thank you — I have your enquiry and will be in touch by email shortly.",
  "booking.err.email_required": "Please enter your email address.",
  "booking.err.email_invalid": "That email address does not look right.",
  "booking.err.date_invalid": "Please choose a date that has not already passed.",
  "booking.err.too_long": "That message is too long.",
  "booking.err.rate_limited": "That is a few enquiries in a row — please try again shortly.",
  "booking.err.server_error": "Something went wrong on my end. Please try again.",
  "booking.err.network": "Could not reach the server. Please check your connection.",
  "booking.err.generic": "Something went wrong. Please try again.",
  // Shoot types. The values stored and emailed to the owner stay in English
  // (site.config.mts); these are only the labels a visitor sees.
  "shoot.automotive": "Automotive",
  "shoot.portrait": "Portrait",
  "shoot.cosplay": "Cosplay",
  "shoot.event": "Event",
  "shoot.street": "Street",
  "shoot.something_else": "Something else"
};
const lv = {
  "nav.home": "Sākums",
  "nav.gallery": "Galerija",
  "nav.about": "Par mani",
  "nav.book": "Rezervēt",
  "nav.bookLong": "Rezervēt fotosesiju",
  "nav.menu": "Izvēlne",
  "nav.language": "Valoda",
  "theme.dark": "Tumšais režīms",
  "hero.by": "fotogrāfs {owner}",
  "hero.viewGallery": "Skatīt galeriju",
  "hero.featuredWork": "Izvēlētie darbi",
  "hero.scroll": "Ritiniet uz leju, lai redzētu izvēlētos darbus",
  "featured.heading": "Izvēlētie darbi",
  "featured.intro": "Mani labākie fotoattēli",
  "gallery.all": "Visi",
  "collection.automotive": "Auto",
  "collection.portraits": "Portreti",
  "collection.street": "Ielas",
  "collection.aviation": "Aviācija",
  "gallery.fallbackTitle": "{name}: fotogrāfijas | {site}",
  "gallery.fallbackHeading": "{name}: fotogrāfijas",
  "gallery.fallbackIntro": "{name}. Fotogrāfs – {owner}.",
  "alt.photo": "{label} — {site}",
  "alt.number": "attēls {n}",
  "alt.default": "Fotogrāfija",
  "seo.imageAlt": "{site} — fotogrāfija, autors {owner}",
  "lightbox.close": "Aizvērt",
  "lightbox.zoom": "Tuvināt",
  "lightbox.prev": "Iepriekšējā",
  "lightbox.next": "Nākamā",
  "lightbox.error": "Attēlu neizdevās ielādēt",
  "about.heading": "Par mani",
  "about.photoAlt": "Mykhailo Zhurba ar teleobjektīvu lidlaukā, aiz viņa uz skrejceļa — vieglā lidmašīna",
  "about.email": "E-pasts",
  "privacy.heading": "Privātums",
  "footer.rights": "Visas tiesības aizsargātas.",
  "footer.privacy": "Privātums",
  "social.facebook": "Ruina Photos Facebook lapa",
  "social.instagram": "Ruina Photos Instagram konts",
  "social.instagramPersonal": "Mykhailo Zhurba Instagram konts",
  "booking.closeForm": "Aizvērt pieteikuma formu",
  "booking.title": "Rezervēt fotosesiju",
  "booking.intro": "Atstājiet savu e-pastu, un es atbildēšu ar sīkāku informāciju. Pārējie lauki nav obligāti — aizpildiet to, ko jau zināt.",
  "booking.email": "E-pasts",
  "booking.name": "Vārds",
  "booking.date": "Vēlamais datums",
  "booking.type": "Fotosesijas veids",
  "booking.typeUnsure": "Vēl nezinu",
  "booking.message": "Vēl kaut kas?",
  "booking.messagePlaceholder": "Vieta, noskaņa, cik cilvēku…",
  "booking.send": "Nosūtīt pieteikumu",
  "booking.sending": "Sūta…",
  "booking.note": "Jūsu e-pasts tiks izmantots tikai, lai atbildētu par fotosesiju.",
  "booking.thanks": "Paldies",
  "booking.done": "Aizvērt",
  "booking.ok.sent": "Paldies! Pārbaudiet savu e-pastu — es jums nosūtīju ziņu.",
  "booking.ok.stored": "Paldies! Jūsu pieteikums ir saņemts, un es drīz sazināšos ar jums pa e-pastu.",
  "booking.err.email_required": "Lūdzu, ievadiet savu e-pasta adresi.",
  "booking.err.email_invalid": "Šī e-pasta adrese neizskatās pareiza.",
  "booking.err.date_invalid": "Lūdzu, izvēlieties datumu, kas vēl nav pagājis.",
  "booking.err.too_long": "Ziņa ir pārāk gara.",
  "booking.err.rate_limited": "Pārāk daudz pieteikumu pēc kārtas — lūdzu, mēģiniet vēlreiz nedaudz vēlāk.",
  "booking.err.server_error": "Radās kļūda manā pusē. Lūdzu, mēģiniet vēlreiz.",
  "booking.err.network": "Neizdevās sazināties ar serveri. Lūdzu, pārbaudiet interneta savienojumu.",
  "booking.err.generic": "Kaut kas nogāja greizi. Lūdzu, mēģiniet vēlreiz.",
  "shoot.automotive": "Auto",
  "shoot.portrait": "Portrets",
  "shoot.cosplay": "Kosplejs",
  "shoot.event": "Pasākums",
  "shoot.street": "Ielu foto",
  "shoot.something_else": "Kaut kas cits"
};
const ru = {
  "nav.home": "Главная",
  "nav.gallery": "Галерея",
  "nav.about": "Обо мне",
  "nav.book": "Записаться",
  "nav.bookLong": "Заказать съёмку",
  "nav.menu": "Меню",
  "nav.language": "Язык",
  "theme.dark": "Тёмная тема",
  "hero.by": "фотограф {owner}",
  "hero.viewGallery": "Смотреть галерею",
  "hero.featuredWork": "Избранные работы",
  "hero.scroll": "Прокрутите вниз к избранным работам",
  "featured.heading": "Избранные работы",
  "featured.intro": "Лучшие из моих фотографий",
  "gallery.all": "Все",
  "collection.automotive": "Авто",
  "collection.portraits": "Портреты",
  "collection.street": "Улица",
  "collection.aviation": "Авиация",
  "gallery.fallbackTitle": "Фотографии: {name} | {site}",
  "gallery.fallbackHeading": "Фотографии: {name}",
  "gallery.fallbackIntro": "{name}. Фотограф — {owner}.",
  "alt.photo": "{label} — {site}",
  "alt.number": "снимок {n}",
  "alt.default": "Фотография",
  "seo.imageAlt": "{site} — фотография, автор {owner}",
  "lightbox.close": "Закрыть",
  "lightbox.zoom": "Масштаб",
  "lightbox.prev": "Предыдущая",
  "lightbox.next": "Следующая",
  "lightbox.error": "Не удалось загрузить изображение",
  "about.heading": "Обо мне",
  "about.photoAlt": "Mykhailo Zhurba с телеобъективом на аэродроме, позади на взлётной полосе — лёгкий самолёт",
  "about.email": "Эл. почта",
  "privacy.heading": "Конфиденциальность",
  "footer.rights": "Все права защищены.",
  "footer.privacy": "Конфиденциальность",
  "social.facebook": "Ruina Photos в Facebook",
  "social.instagram": "Ruina Photos в Instagram",
  "social.instagramPersonal": "Mykhailo Zhurba в Instagram",
  "booking.closeForm": "Закрыть форму",
  "booking.title": "Заказать съёмку",
  "booking.intro": "Оставьте свой e-mail, и я напишу вам с подробностями. Всё, что ниже, заполнять необязательно — укажите то, что уже знаете.",
  "booking.email": "E-mail",
  "booking.name": "Имя",
  "booking.date": "Желаемая дата",
  "booking.type": "Тип съёмки",
  "booking.typeUnsure": "Пока не знаю",
  "booking.message": "Что-нибудь ещё?",
  "booking.messagePlaceholder": "Место, настроение, сколько человек…",
  "booking.send": "Отправить заявку",
  "booking.sending": "Отправка…",
  "booking.note": "Ваш e-mail используется только для ответа по поводу съёмки.",
  "booking.thanks": "Спасибо",
  "booking.done": "Закрыть",
  "booking.ok.sent": "Спасибо! Проверьте почту — я отправил вам письмо.",
  "booking.ok.stored": "Спасибо! Ваша заявка получена, скоро я свяжусь с вами по электронной почте.",
  "booking.err.email_required": "Пожалуйста, укажите свой e-mail.",
  "booking.err.email_invalid": "Похоже, в адресе e-mail ошибка.",
  "booking.err.date_invalid": "Пожалуйста, выберите дату, которая ещё не прошла.",
  "booking.err.too_long": "Сообщение слишком длинное.",
  "booking.err.rate_limited": "Слишком много заявок подряд — попробуйте ещё раз чуть позже.",
  "booking.err.server_error": "Что-то пошло не так с моей стороны. Попробуйте ещё раз.",
  "booking.err.network": "Не удалось связаться с сервером. Проверьте подключение к интернету.",
  "booking.err.generic": "Что-то пошло не так. Попробуйте ещё раз.",
  "shoot.automotive": "Автомобили",
  "shoot.portrait": "Портрет",
  "shoot.cosplay": "Косплей",
  "shoot.event": "Мероприятие",
  "shoot.street": "Уличная съёмка",
  "shoot.something_else": "Другое"
};
const uk = {
  "nav.home": "Головна",
  "nav.gallery": "Галерея",
  "nav.about": "Про мене",
  "nav.book": "Записатися",
  "nav.bookLong": "Замовити зйомку",
  "nav.menu": "Меню",
  "nav.language": "Мова",
  "theme.dark": "Темна тема",
  "hero.by": "фотограф {owner}",
  "hero.viewGallery": "Переглянути галерею",
  "hero.featuredWork": "Вибрані роботи",
  "hero.scroll": "Прокрутіть униз до вибраних робіт",
  "featured.heading": "Вибрані роботи",
  "featured.intro": "Найкращі з моїх фотографій",
  "gallery.all": "Усі",
  "collection.automotive": "Авто",
  "collection.portraits": "Портрети",
  "collection.street": "Вулиця",
  "collection.aviation": "Авіація",
  "gallery.fallbackTitle": "Фотографії: {name} | {site}",
  "gallery.fallbackHeading": "Фотографії: {name}",
  "gallery.fallbackIntro": "{name}. Фотограф — {owner}.",
  "alt.photo": "{label} — {site}",
  "alt.number": "знімок {n}",
  "alt.default": "Фотографія",
  "seo.imageAlt": "{site} — фотографія, автор {owner}",
  "lightbox.close": "Закрити",
  "lightbox.zoom": "Масштаб",
  "lightbox.prev": "Попередня",
  "lightbox.next": "Наступна",
  "lightbox.error": "Не вдалося завантажити зображення",
  "about.heading": "Про мене",
  "about.photoAlt": "Mykhailo Zhurba з телеоб’єктивом на аеродромі, позаду на злітній смузі — легкий літак",
  "about.email": "Ел. пошта",
  "privacy.heading": "Конфіденційність",
  "footer.rights": "Усі права захищено.",
  "footer.privacy": "Конфіденційність",
  "social.facebook": "Ruina Photos у Facebook",
  "social.instagram": "Ruina Photos в Instagram",
  "social.instagramPersonal": "Mykhailo Zhurba в Instagram",
  "booking.closeForm": "Закрити форму",
  "booking.title": "Замовити зйомку",
  "booking.intro": "Залиште свій e-mail, і я напишу вам із подробицями. Усе, що нижче, заповнювати необов’язково — вкажіть те, що вже знаєте.",
  "booking.email": "E-mail",
  "booking.name": "Ім’я",
  "booking.date": "Бажана дата",
  "booking.type": "Тип зйомки",
  "booking.typeUnsure": "Ще не знаю",
  "booking.message": "Щось іще?",
  "booking.messagePlaceholder": "Місце, настрій, скільки людей…",
  "booking.send": "Надіслати заявку",
  "booking.sending": "Надсилання…",
  "booking.note": "Ваш e-mail використовується лише для відповіді щодо зйомки.",
  "booking.thanks": "Дякую",
  "booking.done": "Закрити",
  "booking.ok.sent": "Дякую! Перевірте пошту — я надіслав вам листа.",
  "booking.ok.stored": "Дякую! Вашу заявку отримано, незабаром я зв’яжуся з вами електронною поштою.",
  "booking.err.email_required": "Будь ласка, вкажіть свій e-mail.",
  "booking.err.email_invalid": "Схоже, в адресі e-mail помилка.",
  "booking.err.date_invalid": "Будь ласка, виберіть дату, яка ще не минула.",
  "booking.err.too_long": "Повідомлення задовге.",
  "booking.err.rate_limited": "Забагато заявок поспіль — спробуйте ще раз трохи згодом.",
  "booking.err.server_error": "Щось пішло не так з мого боку. Спробуйте ще раз.",
  "booking.err.network": "Не вдалося з’єднатися із сервером. Перевірте підключення до інтернету.",
  "booking.err.generic": "Щось пішло не так. Спробуйте ще раз.",
  "shoot.automotive": "Автомобілі",
  "shoot.portrait": "Портрет",
  "shoot.cosplay": "Косплей",
  "shoot.event": "Захід",
  "shoot.street": "Вулична зйомка",
  "shoot.something_else": "Інше"
};
const ui = { en, lv, ru, uk };
function fill(template, vars) {
  return template.replace(
    /\{(\w+)\}/g,
    (match, name) => name in vars ? String(vars[name]) : match
  );
}
function useTranslations(locale) {
  const dict = ui[locale] ?? ui.en;
  const t = (key, vars = {}) => fill(dict[key] ?? ui.en[key], vars);
  const tOr = (key, fallback, vars = {}) => key in dict ? fill(dict[key], vars) : fallback;
  return { t, tOr };
}
function shootTypeKey(value) {
  return `shoot.${value.toLowerCase().replace(/\s+/g, "_")}`;
}

export { $$ as $, DEFAULT_LOCALE as D, LOCALE_META as L, PREFIXED_LOCALES as P, siteConfig as a, LOCALES as b, getLocale as g, isLocale as i, localizePath as l, shootTypeKey as s, useTranslations as u };
