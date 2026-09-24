globalThis.process ??= {}; globalThis.process.env ??= {};
import { b as createAstro, c as createComponent, d as renderHead, e as renderSlot, f as renderScript, a as renderTemplate, r as renderComponent, g as addAttribute, m as maybeRenderHead } from '../chunks/astro/server_DAe86DXx.mjs';
/* empty css                                 */
import { l as listLeads, L as LEAD_STATUSES } from '../chunks/db_DqN0KZx9.mjs';
import { c as currentAdmin } from '../chunks/session_BEjCJbxK.mjs';
export { renderers } from '../renderers.mjs';

const $$Astro$1 = createAstro("https://ruina.photos");
const $$AdminLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$AdminLayout;
  const { title, adminEmail } = Astro2.props;
  Astro2.response.headers.set("X-Robots-Tag", "noindex, nofollow");
  Astro2.response.headers.set("Cache-Control", "no-store");
  return renderTemplate`<html lang="en" class="h-full"> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><link rel="icon" type="image/x-icon" href="/favicon.ico"><title>${title}</title>${renderHead()}</head> <body class="bg-gray-50 text-gray-900"> <header class="border-b border-gray-200 bg-white"> <div class="container-custom flex flex-wrap items-center justify-between gap-3 py-4"> <div> <h1 class="text-xl font-semibold">Bookings</h1> <p class="text-sm text-gray-500">ruina.photos admin</p> </div> <div class="flex items-center gap-4"> <span class="hidden text-sm text-gray-500 sm:inline">${adminEmail}</span> <a href="/" class="text-sm text-gray-600 underline hover:text-black">View site</a> <form method="POST" action="/api/auth/logout"> <button type="submit" class="rounded-md border border-gray-300 px-3 py-1.5 text-sm transition-colors hover:border-black hover:bg-black hover:text-white">
Sign out
</button> </form> </div> </div> </header> <main class="container-custom py-8"> ${renderSlot($$result, $$slots["default"])} </main> ${renderScript($$result, "/home/runner/work/ruina.photos/ruina.photos/src/layouts/AdminLayout.astro?astro&type=script&index=0&lang.ts")} </body> </html>`;
}, "/home/runner/work/ruina.photos/ruina.photos/src/layouts/AdminLayout.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(raw || cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://ruina.photos");
const prerender = false;
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const env = Astro2.locals.runtime.env;
  const admin = await currentAdmin(env.DB, Astro2.cookies, Astro2.url);
  if (admin === null) {
    return Astro2.redirect("/api/auth/google/start?next=/admin");
  }
  let leads = [];
  let total = 0;
  let loadError = null;
  try {
    const page = await listLeads(env.DB, { limit: 200, offset: 0 });
    leads = page.leads;
    total = page.total;
  } catch (cause) {
    console.error("admin: could not load leads", cause);
    loadError = "The enquiry list could not be loaded.";
  }
  const dateFormat = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
  function formatReceived(iso) {
    const parsed = new Date(iso);
    return Number.isNaN(parsed.getTime()) ? iso : dateFormat.format(parsed);
  }
  const newCount = leads.filter((lead) => lead.status === "new").length;
  const mailProblems = leads.filter(
    (lead) => lead.email_status === "failed" || lead.email_status === "partial"
  ).length;
  return renderTemplate`${renderComponent($$result, "AdminLayout", $$AdminLayout, { "title": "Bookings \u2014 ruina.photos", "adminEmail": admin.email }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template([" ", '<div x-data="adminDashboard" class="space-y-12"> ', " ", '    <section aria-labelledby="enquiries-heading"> <div class="mb-4 flex flex-wrap items-end justify-between gap-3"> <div> <h2 id="enquiries-heading" class="text-lg font-semibold">Enquiries</h2> <p class="text-sm text-gray-500"> ', " in total", ' </p> </div> <div class="flex items-center gap-2"> <label for="status-filter" class="text-sm text-gray-600">Show</label> <select id="status-filter" x-model="statusFilter" class="border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-black focus:outline-none"> <option value="">Everything</option> ', ' </select> <button type="button" @click="exportCsv()" class="border border-gray-300 px-3 py-1.5 text-sm transition-colors hover:border-black hover:bg-black hover:text-white">\nExport CSV\n</button> </div> </div> ', ` </section>    <section aria-labelledby="calendar-heading"> <div class="mb-4 flex flex-wrap items-end justify-between gap-3"> <div> <h2 id="calendar-heading" class="text-lg font-semibold">Calendar</h2> <p class="text-sm text-gray-500">
Click a day to add a booking, or a booking to edit it.
</p> </div> <div class="flex items-center gap-2"> <button type="button" @click="shiftMonth(-1)" aria-label="Previous month" class="border border-gray-300 px-3 py-1.5 text-sm hover:border-black">
\u2190
</button> <span x-text="monthLabel" class="min-w-[9rem] text-center text-sm font-medium"></span> <button type="button" @click="shiftMonth(1)" aria-label="Next month" class="border border-gray-300 px-3 py-1.5 text-sm hover:border-black">
\u2192
</button> </div> </div> <div x-show="calendarError" class="mb-4 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"> <span x-text="calendarError"></span> <a x-show="needsReconnect" href="/api/auth/google/start?next=/admin" class="ml-2 underline">Reconnect Google</a> </div> <div class="border border-gray-200 bg-white"> <div class="grid grid-cols-7 border-b border-gray-200 bg-gray-50 text-center text-xs tracking-wide text-gray-500 uppercase"> <template x-for="day in weekdayLabels" :key="day"> <div class="px-1 py-2" x-text="day"></div> </template> </div> <div class="grid grid-cols-7"> <template x-for="cell in monthCells" :key="cell.key"> <div class="min-h-[6rem] border-r border-b border-gray-100 p-1.5" :class="cell.inMonth ? 'bg-white' : 'bg-gray-50'"> <button type="button" @click="newEventOn(cell.date)" class="mb-1 w-full text-left text-xs text-gray-400 hover:text-black" :class="cell.isToday ? 'font-bold text-black' : ''" :aria-label="'Add a booking on ' + cell.date"> <span x-text="cell.dayNumber"></span> </button> <template x-for="event in eventsOn(cell.date)" :key="event.id"> <button type="button" @click="editEvent(event)" class="mb-1 block w-full truncate rounded bg-black px-1.5 py-1 text-left text-[11px] text-white hover:bg-gray-700" :title="event.summary"> <span x-text="eventTimeLabel(event)"></span> <span x-text="event.summary || '(untitled)'"></span> </button> </template> </div> </template> </div> </div>  <div x-show="editorOpen" x-cloak class="mt-6 border border-gray-300 bg-white p-5"> <h3 class="mb-4 text-base font-semibold" x-text="editorTitle"></h3> <div class="grid gap-4 sm:grid-cols-2"> <div class="sm:col-span-2"> <label for="event-summary" class="block text-sm font-medium">Title</label> <input id="event-summary" type="text" x-model="draft.summary" class="mt-1 w-full border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"> </div> <div class="sm:col-span-2"> <label class="flex items-center gap-2 text-sm"> <input type="checkbox" x-model="draft.allDay">
All day
</label> </div> <div> <label for="event-start" class="block text-sm font-medium">Starts</label> <input id="event-start" :type="draft.allDay ? 'date' : 'datetime-local'" x-model="draft.start" class="mt-1 w-full border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"> </div> <div> <label for="event-end" class="block text-sm font-medium">Ends</label> <input id="event-end" :type="draft.allDay ? 'date' : 'datetime-local'" x-model="draft.end" class="mt-1 w-full border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"> </div> <div> <label for="event-location" class="block text-sm font-medium">Location</label> <input id="event-location" type="text" x-model="draft.location" class="mt-1 w-full border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"> </div> <div> <label for="event-attendee" class="block text-sm font-medium"> Invite (email) </label> <input id="event-attendee" type="email" x-model="draft.attendeeEmail" class="mt-1 w-full border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"> </div> <div class="sm:col-span-2"> <label for="event-description" class="block text-sm font-medium">Notes</label> <textarea id="event-description" rows="3" x-model="draft.description" class="mt-1 w-full border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"></textarea> </div> </div> <p x-show="editorError" x-text="editorError" role="alert" class="mt-3 text-sm text-red-600"></p> <div class="mt-5 flex flex-wrap items-center gap-3"> <button type="button" @click="saveEvent()" :disabled="editorBusy" class="rounded-md border-2 border-black px-5 py-2 text-sm font-medium transition-colors hover:bg-black hover:text-white disabled:opacity-50"> <span x-text="editorBusy ? 'Saving\u2026' : 'Save booking'"></span> </button> <button type="button" @click="closeEditor()" class="px-3 py-2 text-sm text-gray-600 hover:underline">
Cancel
</button> <button type="button" x-show="draft.eventId" @click="removeEvent()" :disabled="editorBusy" class="ml-auto px-3 py-2 text-sm text-red-600 hover:underline disabled:opacity-50">
Delete booking
</button> </div> </div> </section> </div> <script>
		document.addEventListener('alpine:init', () => {
			const api = async (url, options) => {
				const response = await fetch(url, options);
				const payload = await response.json().catch(() => ({}));
				return { status: response.status, payload };
			};

			/** yyyy-mm-dd in local time; toISOString would shift across the date line. */
			const localDateKey = (date) => {
				const pad = (n) => String(n).padStart(2, '0');
				return \`\${date.getFullYear()}-\${pad(date.getMonth() + 1)}-\${pad(date.getDate())}\`;
			};

			// ---- one enquiry row -------------------------------------------------
			window.Alpine.data('leadRow', () => ({
				saving: false,
				savedAt: '',

				// $el would be the element the handler is bound to (the select, the
				// textarea); $root is always this component's root <tr>.
				get leadId() {
					return this.$root.dataset.leadId;
				},

				flash(text) {
					this.savedAt = text;
					setTimeout(() => (this.savedAt = ''), 2000);
				},

				async patch(body) {
					this.saving = true;
					try {
						const { payload } = await api('/api/admin/leads', {
							method: 'PATCH',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ id: this.leadId, ...body }),
						});
						if (!payload.ok) {
							window.alert(payload.error || 'Could not save that change.');
							return false;
						}
						this.flash('saved');
						return true;
					} finally {
						this.saving = false;
					}
				},

				async setStatus(status) {
					if (await this.patch({ status })) this.$root.dataset.status = status;
				},

				setNotes(adminNotes) {
					this.patch({ adminNotes });
				},

				schedule() {
					const d = this.$root.dataset;
					window.dispatchEvent(
						new CustomEvent('schedule-lead', {
							detail: {
								leadId: d.leadId,
								email: d.email,
								name: d.name,
								date: d.date,
								shootType: d.shootType,
							},
						}),
					);
				},

				async remove() {
					const d = this.$root.dataset;
					if (!window.confirm(\`Delete the enquiry from \${d.email}? This cannot be undone.\`)) {
						return;
					}
					const { payload } = await api(\`/api/admin/leads?id=\${encodeURIComponent(this.leadId)}\`, {
						method: 'DELETE',
					});
					if (payload.ok) {
						this.$root.remove();
					} else {
						window.alert(payload.error || 'Could not delete that enquiry.');
					}
				},
			}));

			// ---- dashboard: filtering, CSV, calendar ------------------------------
			window.Alpine.data('adminDashboard', () => ({
				statusFilter: '',
				weekdayLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
				cursor: new Date(),
				events: [],
				calendarError: '',
				needsReconnect: false,
				editorOpen: false,
				editorBusy: false,
				editorError: '',
				draft: {},

				init() {
					this.applyFilter();
					this.$watch('statusFilter', () => this.applyFilter());
					this.loadEvents();
					window.addEventListener('schedule-lead', (event) => this.scheduleLead(event.detail));
				},

				// Rows are server-rendered, so filtering just toggles them.
				applyFilter() {
					document.querySelectorAll('tr[data-lead-id]').forEach((row) => {
						const matches = this.statusFilter === '' || row.dataset.status === this.statusFilter;
						row.style.display = matches ? '' : 'none';
					});
				},

				exportCsv() {
					const rows = [['Received', 'Email', 'Name', 'Preferred date', 'Shoot type', 'Status']];
					document.querySelectorAll('tr[data-lead-id]').forEach((row) => {
						if (row.style.display === 'none') return;
						const cells = row.querySelectorAll('td');
						rows.push([
							cells[0].innerText.trim(),
							row.dataset.email,
							row.dataset.name,
							row.dataset.date,
							row.dataset.shootType,
							row.dataset.status,
						]);
					});
					// Quote every field and double any embedded quotes.
					const csv = rows
						.map((r) => r.map((v) => \`"\${String(v ?? '').replace(/"/g, '""')}"\`).join(','))
						.join('\\n');
					const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
					const link = document.createElement('a');
					link.href = url;
					link.download = \`ruina-enquiries-\${localDateKey(new Date())}.csv\`;
					link.click();
					URL.revokeObjectURL(url);
				},

				// ---- calendar -----------------------------------------------------
				get monthLabel() {
					return this.cursor.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
				},

				/** Six weeks starting on the Monday on or before the 1st. */
				get monthCells() {
					const year = this.cursor.getFullYear();
					const month = this.cursor.getMonth();
					const first = new Date(year, month, 1);
					const offset = (first.getDay() + 6) % 7; // Monday-first
					const start = new Date(year, month, 1 - offset);
					const todayKey = localDateKey(new Date());

					const cells = [];
					for (let i = 0; i < 42; i += 1) {
						const day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
						const key = localDateKey(day);
						cells.push({
							key,
							date: key,
							dayNumber: day.getDate(),
							inMonth: day.getMonth() === month,
							isToday: key === todayKey,
						});
					}
					return cells;
				},

				shiftMonth(delta) {
					this.cursor = new Date(this.cursor.getFullYear(), this.cursor.getMonth() + delta, 1);
					this.loadEvents();
				},

				async loadEvents() {
					this.calendarError = '';
					this.needsReconnect = false;
					const year = this.cursor.getFullYear();
					const month = this.cursor.getMonth();
					const timeMin = new Date(year, month - 1, 1).toISOString();
					const timeMax = new Date(year, month + 2, 0).toISOString();

					const { payload } = await api(
						\`/api/admin/calendar?timeMin=\${encodeURIComponent(timeMin)}&timeMax=\${encodeURIComponent(timeMax)}\`,
					);
					if (!payload.ok) {
						this.calendarError = payload.error || 'Could not load the calendar.';
						this.needsReconnect = payload.reconnect === true;
						this.events = [];
						return;
					}
					this.events = payload.events || [];
				},

				/** Start date of an event as a local yyyy-mm-dd key. */
				eventDateKey(event) {
					if (event.start.date) return event.start.date;
					if (event.start.dateTime) return localDateKey(new Date(event.start.dateTime));
					return '';
				},

				eventsOn(dateKey) {
					return this.events.filter((event) => this.eventDateKey(event) === dateKey);
				},

				eventTimeLabel(event) {
					if (!event.start.dateTime) return '';
					const time = new Date(event.start.dateTime);
					return time.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) + ' ';
				},

				get editorTitle() {
					return this.draft.eventId ? 'Edit booking' : 'New booking';
				},

				newEventOn(dateKey) {
					this.editorError = '';
					this.draft = {
						eventId: '',
						leadId: '',
						summary: '',
						allDay: false,
						start: \`\${dateKey}T10:00\`,
						end: \`\${dateKey}T12:00\`,
						location: '',
						description: '',
						attendeeEmail: '',
					};
					this.editorOpen = true;
				},

				editEvent(event) {
					this.editorError = '';
					const allDay = Boolean(event.start.date);
					const toLocalInput = (iso) => {
						const d = new Date(iso);
						const pad = (n) => String(n).padStart(2, '0');
						return \`\${localDateKey(d)}T\${pad(d.getHours())}:\${pad(d.getMinutes())}\`;
					};
					this.draft = {
						eventId: event.id,
						leadId: '',
						summary: event.summary || '',
						allDay,
						start: allDay ? event.start.date : toLocalInput(event.start.dateTime),
						end: allDay ? event.end.date : toLocalInput(event.end.dateTime),
						location: event.location || '',
						description: event.description || '',
						attendeeEmail: (event.attendees && event.attendees[0]?.email) || '',
					};
					this.editorOpen = true;
					this.$nextTick(() => document.getElementById('event-summary')?.focus());
				},

				/** Prefills the editor from an enquiry's "Schedule" button. */
				scheduleLead(lead) {
					const date = lead.date || localDateKey(new Date());
					const who = lead.name || lead.email;
					this.editorError = '';
					this.draft = {
						eventId: '',
						leadId: lead.leadId,
						summary: \`\${lead.shootType || 'Shoot'} \u2014 \${who}\`,
						allDay: false,
						start: \`\${date}T10:00\`,
						end: \`\${date}T12:00\`,
						location: '',
						description: \`Booked from the enquiry sent by \${lead.email}.\`,
						attendeeEmail: lead.email,
					};
					this.editorOpen = true;
					this.$nextTick(() => {
						document.getElementById('event-summary')?.scrollIntoView({ block: 'center' });
						document.getElementById('event-summary')?.focus();
					});
				},

				closeEditor() {
					this.editorOpen = false;
					this.editorError = '';
				},

				async saveEvent() {
					this.editorBusy = true;
					this.editorError = '';
					try {
						const body = {
							summary: this.draft.summary,
							start: this.draft.start,
							end: this.draft.end,
							location: this.draft.location,
							description: this.draft.description,
							attendeeEmail: this.draft.attendeeEmail || undefined,
						};
						const isEdit = Boolean(this.draft.eventId);
						if (isEdit) body.eventId = this.draft.eventId;
						if (!isEdit && this.draft.leadId) body.leadId = this.draft.leadId;

						const { payload } = await api('/api/admin/calendar', {
							method: isEdit ? 'PATCH' : 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify(body),
						});

						if (!payload.ok) {
							this.editorError = payload.error || 'Could not save the booking.';
							this.needsReconnect = payload.reconnect === true;
							return;
						}

						// Reflect a lead that just became a booking without a full reload.
						if (!isEdit && this.draft.leadId) {
							const row = document.querySelector(\`tr[data-lead-id="\${this.draft.leadId}"]\`);
							if (row) {
								row.dataset.status = 'booked';
								const select = row.querySelector('select');
								if (select) select.value = 'booked';
							}
						}

						this.editorOpen = false;
						await this.loadEvents();
					} finally {
						this.editorBusy = false;
					}
				},

				async removeEvent() {
					if (!window.confirm('Delete this booking from your Google Calendar?')) return;
					this.editorBusy = true;
					try {
						const { payload } = await api(
							\`/api/admin/calendar?eventId=\${encodeURIComponent(this.draft.eventId)}\`,
							{ method: 'DELETE' },
						);
						if (!payload.ok) {
							this.editorError = payload.error || 'Could not delete the booking.';
							return;
						}
						this.editorOpen = false;
						await this.loadEvents();
					} finally {
						this.editorBusy = false;
					}
				},
			}));
		});
	<\/script> `], [" ", '<div x-data="adminDashboard" class="space-y-12"> ', " ", '    <section aria-labelledby="enquiries-heading"> <div class="mb-4 flex flex-wrap items-end justify-between gap-3"> <div> <h2 id="enquiries-heading" class="text-lg font-semibold">Enquiries</h2> <p class="text-sm text-gray-500"> ', " in total", ' </p> </div> <div class="flex items-center gap-2"> <label for="status-filter" class="text-sm text-gray-600">Show</label> <select id="status-filter" x-model="statusFilter" class="border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-black focus:outline-none"> <option value="">Everything</option> ', ' </select> <button type="button" @click="exportCsv()" class="border border-gray-300 px-3 py-1.5 text-sm transition-colors hover:border-black hover:bg-black hover:text-white">\nExport CSV\n</button> </div> </div> ', ` </section>    <section aria-labelledby="calendar-heading"> <div class="mb-4 flex flex-wrap items-end justify-between gap-3"> <div> <h2 id="calendar-heading" class="text-lg font-semibold">Calendar</h2> <p class="text-sm text-gray-500">
Click a day to add a booking, or a booking to edit it.
</p> </div> <div class="flex items-center gap-2"> <button type="button" @click="shiftMonth(-1)" aria-label="Previous month" class="border border-gray-300 px-3 py-1.5 text-sm hover:border-black">
\u2190
</button> <span x-text="monthLabel" class="min-w-[9rem] text-center text-sm font-medium"></span> <button type="button" @click="shiftMonth(1)" aria-label="Next month" class="border border-gray-300 px-3 py-1.5 text-sm hover:border-black">
\u2192
</button> </div> </div> <div x-show="calendarError" class="mb-4 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"> <span x-text="calendarError"></span> <a x-show="needsReconnect" href="/api/auth/google/start?next=/admin" class="ml-2 underline">Reconnect Google</a> </div> <div class="border border-gray-200 bg-white"> <div class="grid grid-cols-7 border-b border-gray-200 bg-gray-50 text-center text-xs tracking-wide text-gray-500 uppercase"> <template x-for="day in weekdayLabels" :key="day"> <div class="px-1 py-2" x-text="day"></div> </template> </div> <div class="grid grid-cols-7"> <template x-for="cell in monthCells" :key="cell.key"> <div class="min-h-[6rem] border-r border-b border-gray-100 p-1.5" :class="cell.inMonth ? 'bg-white' : 'bg-gray-50'"> <button type="button" @click="newEventOn(cell.date)" class="mb-1 w-full text-left text-xs text-gray-400 hover:text-black" :class="cell.isToday ? 'font-bold text-black' : ''" :aria-label="'Add a booking on ' + cell.date"> <span x-text="cell.dayNumber"></span> </button> <template x-for="event in eventsOn(cell.date)" :key="event.id"> <button type="button" @click="editEvent(event)" class="mb-1 block w-full truncate rounded bg-black px-1.5 py-1 text-left text-[11px] text-white hover:bg-gray-700" :title="event.summary"> <span x-text="eventTimeLabel(event)"></span> <span x-text="event.summary || '(untitled)'"></span> </button> </template> </div> </template> </div> </div>  <div x-show="editorOpen" x-cloak class="mt-6 border border-gray-300 bg-white p-5"> <h3 class="mb-4 text-base font-semibold" x-text="editorTitle"></h3> <div class="grid gap-4 sm:grid-cols-2"> <div class="sm:col-span-2"> <label for="event-summary" class="block text-sm font-medium">Title</label> <input id="event-summary" type="text" x-model="draft.summary" class="mt-1 w-full border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"> </div> <div class="sm:col-span-2"> <label class="flex items-center gap-2 text-sm"> <input type="checkbox" x-model="draft.allDay">
All day
</label> </div> <div> <label for="event-start" class="block text-sm font-medium">Starts</label> <input id="event-start" :type="draft.allDay ? 'date' : 'datetime-local'" x-model="draft.start" class="mt-1 w-full border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"> </div> <div> <label for="event-end" class="block text-sm font-medium">Ends</label> <input id="event-end" :type="draft.allDay ? 'date' : 'datetime-local'" x-model="draft.end" class="mt-1 w-full border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"> </div> <div> <label for="event-location" class="block text-sm font-medium">Location</label> <input id="event-location" type="text" x-model="draft.location" class="mt-1 w-full border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"> </div> <div> <label for="event-attendee" class="block text-sm font-medium"> Invite (email) </label> <input id="event-attendee" type="email" x-model="draft.attendeeEmail" class="mt-1 w-full border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"> </div> <div class="sm:col-span-2"> <label for="event-description" class="block text-sm font-medium">Notes</label> <textarea id="event-description" rows="3" x-model="draft.description" class="mt-1 w-full border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"></textarea> </div> </div> <p x-show="editorError" x-text="editorError" role="alert" class="mt-3 text-sm text-red-600"></p> <div class="mt-5 flex flex-wrap items-center gap-3"> <button type="button" @click="saveEvent()" :disabled="editorBusy" class="rounded-md border-2 border-black px-5 py-2 text-sm font-medium transition-colors hover:bg-black hover:text-white disabled:opacity-50"> <span x-text="editorBusy ? 'Saving\u2026' : 'Save booking'"></span> </button> <button type="button" @click="closeEditor()" class="px-3 py-2 text-sm text-gray-600 hover:underline">
Cancel
</button> <button type="button" x-show="draft.eventId" @click="removeEvent()" :disabled="editorBusy" class="ml-auto px-3 py-2 text-sm text-red-600 hover:underline disabled:opacity-50">
Delete booking
</button> </div> </div> </section> </div> <script>
		document.addEventListener('alpine:init', () => {
			const api = async (url, options) => {
				const response = await fetch(url, options);
				const payload = await response.json().catch(() => ({}));
				return { status: response.status, payload };
			};

			/** yyyy-mm-dd in local time; toISOString would shift across the date line. */
			const localDateKey = (date) => {
				const pad = (n) => String(n).padStart(2, '0');
				return \\\`\\\${date.getFullYear()}-\\\${pad(date.getMonth() + 1)}-\\\${pad(date.getDate())}\\\`;
			};

			// ---- one enquiry row -------------------------------------------------
			window.Alpine.data('leadRow', () => ({
				saving: false,
				savedAt: '',

				// $el would be the element the handler is bound to (the select, the
				// textarea); $root is always this component's root <tr>.
				get leadId() {
					return this.$root.dataset.leadId;
				},

				flash(text) {
					this.savedAt = text;
					setTimeout(() => (this.savedAt = ''), 2000);
				},

				async patch(body) {
					this.saving = true;
					try {
						const { payload } = await api('/api/admin/leads', {
							method: 'PATCH',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({ id: this.leadId, ...body }),
						});
						if (!payload.ok) {
							window.alert(payload.error || 'Could not save that change.');
							return false;
						}
						this.flash('saved');
						return true;
					} finally {
						this.saving = false;
					}
				},

				async setStatus(status) {
					if (await this.patch({ status })) this.$root.dataset.status = status;
				},

				setNotes(adminNotes) {
					this.patch({ adminNotes });
				},

				schedule() {
					const d = this.$root.dataset;
					window.dispatchEvent(
						new CustomEvent('schedule-lead', {
							detail: {
								leadId: d.leadId,
								email: d.email,
								name: d.name,
								date: d.date,
								shootType: d.shootType,
							},
						}),
					);
				},

				async remove() {
					const d = this.$root.dataset;
					if (!window.confirm(\\\`Delete the enquiry from \\\${d.email}? This cannot be undone.\\\`)) {
						return;
					}
					const { payload } = await api(\\\`/api/admin/leads?id=\\\${encodeURIComponent(this.leadId)}\\\`, {
						method: 'DELETE',
					});
					if (payload.ok) {
						this.$root.remove();
					} else {
						window.alert(payload.error || 'Could not delete that enquiry.');
					}
				},
			}));

			// ---- dashboard: filtering, CSV, calendar ------------------------------
			window.Alpine.data('adminDashboard', () => ({
				statusFilter: '',
				weekdayLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
				cursor: new Date(),
				events: [],
				calendarError: '',
				needsReconnect: false,
				editorOpen: false,
				editorBusy: false,
				editorError: '',
				draft: {},

				init() {
					this.applyFilter();
					this.$watch('statusFilter', () => this.applyFilter());
					this.loadEvents();
					window.addEventListener('schedule-lead', (event) => this.scheduleLead(event.detail));
				},

				// Rows are server-rendered, so filtering just toggles them.
				applyFilter() {
					document.querySelectorAll('tr[data-lead-id]').forEach((row) => {
						const matches = this.statusFilter === '' || row.dataset.status === this.statusFilter;
						row.style.display = matches ? '' : 'none';
					});
				},

				exportCsv() {
					const rows = [['Received', 'Email', 'Name', 'Preferred date', 'Shoot type', 'Status']];
					document.querySelectorAll('tr[data-lead-id]').forEach((row) => {
						if (row.style.display === 'none') return;
						const cells = row.querySelectorAll('td');
						rows.push([
							cells[0].innerText.trim(),
							row.dataset.email,
							row.dataset.name,
							row.dataset.date,
							row.dataset.shootType,
							row.dataset.status,
						]);
					});
					// Quote every field and double any embedded quotes.
					const csv = rows
						.map((r) => r.map((v) => \\\`"\\\${String(v ?? '').replace(/"/g, '""')}"\\\`).join(','))
						.join('\\\\n');
					const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
					const link = document.createElement('a');
					link.href = url;
					link.download = \\\`ruina-enquiries-\\\${localDateKey(new Date())}.csv\\\`;
					link.click();
					URL.revokeObjectURL(url);
				},

				// ---- calendar -----------------------------------------------------
				get monthLabel() {
					return this.cursor.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
				},

				/** Six weeks starting on the Monday on or before the 1st. */
				get monthCells() {
					const year = this.cursor.getFullYear();
					const month = this.cursor.getMonth();
					const first = new Date(year, month, 1);
					const offset = (first.getDay() + 6) % 7; // Monday-first
					const start = new Date(year, month, 1 - offset);
					const todayKey = localDateKey(new Date());

					const cells = [];
					for (let i = 0; i < 42; i += 1) {
						const day = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
						const key = localDateKey(day);
						cells.push({
							key,
							date: key,
							dayNumber: day.getDate(),
							inMonth: day.getMonth() === month,
							isToday: key === todayKey,
						});
					}
					return cells;
				},

				shiftMonth(delta) {
					this.cursor = new Date(this.cursor.getFullYear(), this.cursor.getMonth() + delta, 1);
					this.loadEvents();
				},

				async loadEvents() {
					this.calendarError = '';
					this.needsReconnect = false;
					const year = this.cursor.getFullYear();
					const month = this.cursor.getMonth();
					const timeMin = new Date(year, month - 1, 1).toISOString();
					const timeMax = new Date(year, month + 2, 0).toISOString();

					const { payload } = await api(
						\\\`/api/admin/calendar?timeMin=\\\${encodeURIComponent(timeMin)}&timeMax=\\\${encodeURIComponent(timeMax)}\\\`,
					);
					if (!payload.ok) {
						this.calendarError = payload.error || 'Could not load the calendar.';
						this.needsReconnect = payload.reconnect === true;
						this.events = [];
						return;
					}
					this.events = payload.events || [];
				},

				/** Start date of an event as a local yyyy-mm-dd key. */
				eventDateKey(event) {
					if (event.start.date) return event.start.date;
					if (event.start.dateTime) return localDateKey(new Date(event.start.dateTime));
					return '';
				},

				eventsOn(dateKey) {
					return this.events.filter((event) => this.eventDateKey(event) === dateKey);
				},

				eventTimeLabel(event) {
					if (!event.start.dateTime) return '';
					const time = new Date(event.start.dateTime);
					return time.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) + ' ';
				},

				get editorTitle() {
					return this.draft.eventId ? 'Edit booking' : 'New booking';
				},

				newEventOn(dateKey) {
					this.editorError = '';
					this.draft = {
						eventId: '',
						leadId: '',
						summary: '',
						allDay: false,
						start: \\\`\\\${dateKey}T10:00\\\`,
						end: \\\`\\\${dateKey}T12:00\\\`,
						location: '',
						description: '',
						attendeeEmail: '',
					};
					this.editorOpen = true;
				},

				editEvent(event) {
					this.editorError = '';
					const allDay = Boolean(event.start.date);
					const toLocalInput = (iso) => {
						const d = new Date(iso);
						const pad = (n) => String(n).padStart(2, '0');
						return \\\`\\\${localDateKey(d)}T\\\${pad(d.getHours())}:\\\${pad(d.getMinutes())}\\\`;
					};
					this.draft = {
						eventId: event.id,
						leadId: '',
						summary: event.summary || '',
						allDay,
						start: allDay ? event.start.date : toLocalInput(event.start.dateTime),
						end: allDay ? event.end.date : toLocalInput(event.end.dateTime),
						location: event.location || '',
						description: event.description || '',
						attendeeEmail: (event.attendees && event.attendees[0]?.email) || '',
					};
					this.editorOpen = true;
					this.$nextTick(() => document.getElementById('event-summary')?.focus());
				},

				/** Prefills the editor from an enquiry's "Schedule" button. */
				scheduleLead(lead) {
					const date = lead.date || localDateKey(new Date());
					const who = lead.name || lead.email;
					this.editorError = '';
					this.draft = {
						eventId: '',
						leadId: lead.leadId,
						summary: \\\`\\\${lead.shootType || 'Shoot'} \u2014 \\\${who}\\\`,
						allDay: false,
						start: \\\`\\\${date}T10:00\\\`,
						end: \\\`\\\${date}T12:00\\\`,
						location: '',
						description: \\\`Booked from the enquiry sent by \\\${lead.email}.\\\`,
						attendeeEmail: lead.email,
					};
					this.editorOpen = true;
					this.$nextTick(() => {
						document.getElementById('event-summary')?.scrollIntoView({ block: 'center' });
						document.getElementById('event-summary')?.focus();
					});
				},

				closeEditor() {
					this.editorOpen = false;
					this.editorError = '';
				},

				async saveEvent() {
					this.editorBusy = true;
					this.editorError = '';
					try {
						const body = {
							summary: this.draft.summary,
							start: this.draft.start,
							end: this.draft.end,
							location: this.draft.location,
							description: this.draft.description,
							attendeeEmail: this.draft.attendeeEmail || undefined,
						};
						const isEdit = Boolean(this.draft.eventId);
						if (isEdit) body.eventId = this.draft.eventId;
						if (!isEdit && this.draft.leadId) body.leadId = this.draft.leadId;

						const { payload } = await api('/api/admin/calendar', {
							method: isEdit ? 'PATCH' : 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify(body),
						});

						if (!payload.ok) {
							this.editorError = payload.error || 'Could not save the booking.';
							this.needsReconnect = payload.reconnect === true;
							return;
						}

						// Reflect a lead that just became a booking without a full reload.
						if (!isEdit && this.draft.leadId) {
							const row = document.querySelector(\\\`tr[data-lead-id="\\\${this.draft.leadId}"]\\\`);
							if (row) {
								row.dataset.status = 'booked';
								const select = row.querySelector('select');
								if (select) select.value = 'booked';
							}
						}

						this.editorOpen = false;
						await this.loadEvents();
					} finally {
						this.editorBusy = false;
					}
				},

				async removeEvent() {
					if (!window.confirm('Delete this booking from your Google Calendar?')) return;
					this.editorBusy = true;
					try {
						const { payload } = await api(
							\\\`/api/admin/calendar?eventId=\\\${encodeURIComponent(this.draft.eventId)}\\\`,
							{ method: 'DELETE' },
						);
						if (!payload.ok) {
							this.editorError = payload.error || 'Could not delete the booking.';
							return;
						}
						this.editorOpen = false;
						await this.loadEvents();
					} finally {
						this.editorBusy = false;
					}
				},
			}));
		});
	<\/script> `])), maybeRenderHead(), loadError && renderTemplate`<p class="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">${loadError}</p>`, mailProblems > 0 && renderTemplate`<p class="border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"> ${mailProblems} enquir${mailProblems === 1 ? "y" : "ies"} did not get an auto-reply. Those
					rows are marked below — reply by hand so nobody is left waiting.
</p>`, total, newCount > 0 ? `, ${newCount} new` : "", LEAD_STATUSES.map((status) => renderTemplate`<option${addAttribute(status, "value")}>${status}</option>`), leads.length === 0 && !loadError ? renderTemplate`<p class="border border-dashed border-gray-300 bg-white px-4 py-10 text-center text-sm text-gray-500">
No enquiries yet. They will appear here as soon as someone uses the booking popup.
</p>` : renderTemplate`<div class="overflow-x-auto border border-gray-200 bg-white"> <table class="w-full min-w-[68rem] text-left text-sm"> <thead class="border-b border-gray-200 bg-gray-50 text-xs tracking-wide text-gray-500 uppercase"> <tr> <th scope="col" class="px-3 py-2 font-medium">
Received
</th> <th scope="col" class="px-3 py-2 font-medium">
Email
</th> <th scope="col" class="px-3 py-2 font-medium">
Name
</th> <th scope="col" class="px-3 py-2 font-medium">
Wants
</th> <th scope="col" class="px-3 py-2 font-medium">
Message
</th> <th scope="col" class="px-3 py-2 font-medium">
Status
</th> <th scope="col" class="px-3 py-2 font-medium">
Notes
</th> <th scope="col" class="px-3 py-2 font-medium"> <span class="sr-only">Actions</span> </th> </tr> </thead> <tbody class="divide-y divide-gray-100"> ${leads.map((lead) => renderTemplate`<tr x-data="leadRow"${addAttribute(lead.id, "data-lead-id")}${addAttribute(lead.status, "data-status")}${addAttribute(lead.email, "data-email")}${addAttribute(lead.name ?? "", "data-name")}${addAttribute(lead.preferred_date ?? "", "data-date")}${addAttribute(lead.shoot_type ?? "", "data-shoot-type")} class="align-top"> <td class="px-3 py-3 whitespace-nowrap text-gray-500"> ${formatReceived(lead.created_at)} </td> <td class="px-3 py-3"> <a${addAttribute(`mailto:${lead.email}`, "href")} class="underline hover:text-black"> ${lead.email} </a> ${(lead.email_status === "failed" || lead.email_status === "partial") && renderTemplate`<span${addAttribute(lead.email_error ?? "Delivery failed", "title")} class="mt-1 block text-xs text-amber-700">
auto-reply not delivered
</span>`} </td> <td class="px-3 py-3">${lead.name ?? "\u2014"}</td> <td class="px-3 py-3 whitespace-nowrap"> ${lead.shoot_type ?? "\u2014"} ${lead.preferred_date && renderTemplate`<span class="block text-xs text-gray-500">${lead.preferred_date}</span>`} </td> <td class="w-64 max-w-xs px-3 py-3 whitespace-pre-wrap text-gray-600"> ${lead.message ?? "\u2014"} </td> <td class="px-3 py-3"> <select${addAttribute(`Status for ${lead.email}`, "aria-label")} @change="setStatus($event.target.value)" class="border border-gray-300 bg-white px-2 py-1 text-sm focus:border-black focus:outline-none"> ${LEAD_STATUSES.map((status) => renderTemplate`<option${addAttribute(status, "value")}${addAttribute(status === lead.status, "selected")}> ${status} </option>`)} </select> ${lead.calendar_event_id && renderTemplate`<span class="mt-1 block text-xs text-green-700">on calendar</span>`} </td> <td class="px-3 py-3"> <textarea${addAttribute(`Notes for ${lead.email}`, "aria-label")} rows="2" @change="setNotes($event.target.value)" placeholder="Private notes…" class="w-40 border border-gray-300 px-2 py-1 text-sm focus:border-black focus:outline-none">${lead.admin_notes ?? ""}</textarea> </td> <td class="px-3 py-3 whitespace-nowrap"> <div class="flex flex-col gap-1"> <button type="button" @click="schedule()" class="border border-gray-300 px-2 py-1 text-xs transition-colors hover:border-black hover:bg-black hover:text-white">
Schedule
</button> <button type="button" @click="remove()" class="px-2 py-1 text-xs text-red-600 hover:underline">
Delete
</button> </div> <span x-show="saving" class="text-xs text-gray-400">
saving…
</span> <span x-show="savedAt" x-text="savedAt" class="text-xs text-green-600"></span> </td> </tr>`)} </tbody> </table> </div>`) })}`;
}, "/home/runner/work/ruina.photos/ruina.photos/src/pages/admin/index.astro", void 0);

const $$file = "/home/runner/work/ruina.photos/ruina.photos/src/pages/admin/index.astro";
const $$url = "/admin";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	prerender,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
