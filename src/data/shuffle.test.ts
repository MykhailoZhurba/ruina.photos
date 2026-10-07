import { describe, expect, it } from 'vitest';
import { seededRandom, shuffleWithinCollections } from './shuffle';

const photo = (collection: string, n: number) => ({
	id: `${collection}-${n}`,
	collections: [collection],
});
const photos = [
	...Array.from({ length: 12 }, (_, i) => photo('cars', i)),
	...Array.from({ length: 6 }, (_, i) => photo('portraits', i)),
	...Array.from({ length: 6 }, (_, i) => photo('street', i)),
];

describe('shuffleWithinCollections', () => {
	it('keeps every photo exactly once', () => {
		const result = shuffleWithinCollections(photos);
		expect(result).toHaveLength(photos.length);
		expect(new Set(result.map((p) => p.id))).toEqual(new Set(photos.map((p) => p.id)));
	});

	it('keeps each category together, in the order the categories first appear', () => {
		const result = shuffleWithinCollections(photos);
		const categories = result.map((p) => p.collections[0]);
		expect(categories.filter((c, i) => c !== categories[i - 1])).toEqual([
			'cars',
			'portraits',
			'street',
		]);
	});

	it('shuffles the photos inside a category', () => {
		const cars = (list: typeof photos) =>
			list.filter((p) => p.collections[0] === 'cars').map((p) => p.id);
		expect(cars(shuffleWithinCollections(photos))).not.toEqual(cars(photos));
	});

	it('does not change the input', () => {
		const copy = [...photos];
		shuffleWithinCollections(photos);
		expect(photos).toEqual(copy);
	});

	it('gives the same order for the same seed and a different one for another seed', () => {
		expect(shuffleWithinCollections(photos, [], 1)).toEqual(
			shuffleWithinCollections(photos, [], 1),
		);
		expect(shuffleWithinCollections(photos, [], 1)).not.toEqual(
			shuffleWithinCollections(photos, [], 2),
		);
	});

	it('ignores skipped collections such as "featured" when picking a photo\'s category', () => {
		const mixed = [
			{ id: 'a', collections: ['featured', 'cars'] },
			{ id: 'b', collections: ['featured', 'street'] },
			{ id: 'c', collections: ['cars'] },
		];
		const result = shuffleWithinCollections(mixed, ['featured']);
		expect(result.map((p) => p.id).sort()).toEqual(['a', 'b', 'c']);
		// "a" and "c" are both cars, so they stay together and "b" (street) comes after them.
		expect(result[2].id).toBe('b');
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
