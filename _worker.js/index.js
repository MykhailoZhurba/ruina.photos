globalThis.process ??= {}; globalThis.process.env ??= {};
import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_C_65fPqw.mjs';
import { manifest } from './manifest_DNUcrvqU.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/about.astro.mjs');
const _page2 = () => import('./pages/admin.astro.mjs');
const _page3 = () => import('./pages/api/admin/calendar.astro.mjs');
const _page4 = () => import('./pages/api/admin/leads.astro.mjs');
const _page5 = () => import('./pages/api/auth/google/callback.astro.mjs');
const _page6 = () => import('./pages/api/auth/google/start.astro.mjs');
const _page7 = () => import('./pages/api/auth/logout.astro.mjs');
const _page8 = () => import('./pages/api/booking.astro.mjs');
const _page9 = () => import('./pages/collections/_---collection_.astro.mjs');
const _page10 = () => import('./pages/privacy.astro.mjs');
const _page11 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/@astrojs/cloudflare/dist/entrypoints/image-endpoint.js", _page0],
    ["src/pages/about.astro", _page1],
    ["src/pages/admin/index.astro", _page2],
    ["src/pages/api/admin/calendar.ts", _page3],
    ["src/pages/api/admin/leads.ts", _page4],
    ["src/pages/api/auth/google/callback.ts", _page5],
    ["src/pages/api/auth/google/start.ts", _page6],
    ["src/pages/api/auth/logout.ts", _page7],
    ["src/pages/api/booking.ts", _page8],
    ["src/pages/collections/[...collection].astro", _page9],
    ["src/pages/privacy.astro", _page10],
    ["src/pages/index.astro", _page11]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./_noop-actions.mjs'),
    middleware: () => import('./_astro-internal_middleware.mjs')
});
const _args = undefined;
const _exports = createExports(_manifest);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (_start in serverEntrypointModule) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { __astrojsSsrVirtualEntry as default, pageMap };
