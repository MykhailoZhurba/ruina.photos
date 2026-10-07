import { describe, expect, it } from 'vitest';
import { seededRandom, spreadByCollection } from './spread';

const photo = (collection: string, n: number) => ({
	id: `${collection}-${n}`,
	collections: [collection],
});
const photos = [
	...Array.from({ length: 24 }, (_, i) => photo('cars', i)),
	...Array.from({ length: 8 }, (_, i) => photo('street', i)),
	...Array.from({ length: 8 }, (_, i) => photo('portraits', i)),
];

describe('spreadByCollection', () => {
	it('keeps every photo exactly once', () => {
		const result = spreadByCollection(photos);
		expect(result).toHaveLength(photos.length);
		expect(new Set(result.map((p) => p.id))).toEqual(new Set(photos.map((p) => p.id)));
	});

	it('does not change the input', () => {
		const copy = [...photos];
		spreadByCollection(photos);
		expect(photos).toEqual(copy);
	});

	it('gives the same order for the same seed and a different one for another seed', () => {
		expect(spreadByCollection(photos, [], 1)).toEqual(spreadByCollection(photos, [], 1));
		expect(spreadByCollection(photos, [], 1)).not.toEqual(spreadByCollection(photos, [], 2));
	});

	it('spreads small categories through the list instead of leaving them at the end', () => {
		const result = spreadByCollection(photos);
		for (const collection of ['street', 'portraits']) {
			const positions = result.flatMap((p, i) => (p.collections[0] === collection ? [i] : []));
			expect(positions[0]).toBeLessThan(10);
			expect(positions[positions.length - 1]).toBeGreaterThan(30);
		}
	});

	it('does not put more than a few photos of one category in a row', () => {
		const result = spreadByCollection(photos);
		let longest = 1;
		let run = 1;
		for (let i = 1; i < result.length; i++) {
			run = result[i].collections[0] === result[i - 1].collections[0] ? run + 1 : 1;
			longest = Math.max(longest, run);
		}
		expect(longest).toBeLessThanOrEqual(6);
	});

	it('ignores skipped collections such as "featured" when picking a photo\'s category', () => {
		const featured = [
			{ id: 'a', collections: ['featured', 'cars'] },
			{ id: 'b', collections: ['featured', 'street'] },
		];
		expect(spreadByCollection(featured, ['featured'])).toHaveLength(2);
	});
});

describe('seededRandom', () => {
	it('stays between 0 and 1 and repeats for the same seed', () => {
		const a = seededRandom(7);
		const b = seededRandom(7);
		for (let i = 0; i < 100; i++) {
			const value = a();
			expect(value).toBeGreaterThanOrEqual(0);
			expect(value).toBeLessThan(1);
			expect(value).toBe(b());
		}
	});
});
