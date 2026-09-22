globalThis.process ??= {}; globalThis.process.env ??= {};
import { c as createComponent, a as createAstro, m as maybeRenderHead, s as spreadAttributes, d as addAttribute, f as renderSlot, r as renderTemplate, b as renderComponent } from './astro/server_BdF0GVBr.mjs';

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
    description: "Mykhailo Zhurba is the photographer behind Ruina Photos: automotive, portrait, aviation and aerial photography. Learn about the work and how to book a shoot."
  },
  privacy: {
    title: "Privacy | Ruina Photos",
    description: "How Ruina Photos handles your data: no cookies, no analytics and no tracking."
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
  shootTypes: [
    "Automotive",
    "Portrait",
    "Cosplay",
    "Aviation",
    "Event",
    "Street",
    "Something else"
  ],
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

export { $$ as $, siteConfig as s };
