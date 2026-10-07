/**
 * Mixes photos so the gallery does not show long runs of one category.
 *
 * Each category is shuffled on its own, then the categories are merged in proportion to their
 * size: a category with half the photos gets about every other slot. The order is random-looking
 * but seeded, so it is the same on every build (and every language) instead of changing with each
 * deploy.
 */

/** Small seeded random number generator (mulberry32): same seed, same sequence. */
export function seededRandom(seed: number): () => number {
	let state = seed >>> 0;
	return () => {
		state = (state + 0x6d2b79f5) >>> 0;
		let t = state;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

const defaultSeed = 20261007;

export function spreadByCollection<T extends { collections: string[] }>(
	items: T[],
	skipCollections: string[] = [],
	seed: number = defaultSeed,
): T[] {
	const random = seededRandom(seed);
	const groups = new Map<string, T[]>();
	for (const item of items) {
		const key = item.collections.find((id) => !skipCollections.includes(id)) ?? '';
		groups.set(key, [...(groups.get(key) ?? []), item]);
	}

	const slotted: { item: T; position: number }[] = [];
	for (const group of groups.values()) {
		// Fisher-Yates shuffle within the category.
		for (let i = group.length - 1; i > 0; i--) {
			const j = Math.floor(random() * (i + 1));
			[group[i], group[j]] = [group[j], group[i]];
		}
		// Spread the category evenly over 0..1, nudged so ties and patterns look natural.
		group.forEach((item, index) => {
			slotted.push({ item, position: (index + random()) / group.length });
		});
	}
	return slotted.sort((a, b) => a.position - b.position).map((slot) => slot.item);
}
