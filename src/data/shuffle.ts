/**
 * Shuffles the photos inside each category (Automotive, Portraits, ...) on its own. The categories
 * keep their usual order, so the "All" gallery reads as one block per category, each in a mixed
 * order, instead of every category blended together.
 *
 * The shuffle is seeded, so the order is the same on every build (and in every language) instead
 * of changing with each deploy.
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

/**
 * @param items photos in gallery order
 * @param skipCollections collection ids that are not categories (such as "featured"), ignored
 *   when working out which category a photo belongs to
 */
export function shuffleWithinCollections<T extends { collections: string[] }>(
	items: T[],
	skipCollections: string[] = [],
	seed: number = defaultSeed,
): T[] {
	const random = seededRandom(seed);
	// A Map keeps categories in the order they first appear.
	const groups = new Map<string, T[]>();
	for (const item of items) {
		const key = item.collections.find((id) => !skipCollections.includes(id)) ?? '';
		groups.set(key, [...(groups.get(key) ?? []), item]);
	}

	return [...groups.values()].flatMap((group) => {
		// Fisher-Yates shuffle.
		for (let i = group.length - 1; i > 0; i--) {
			const j = Math.floor(random() * (i + 1));
			[group[i], group[j]] = [group[j], group[i]];
		}
		return group;
	});
}
