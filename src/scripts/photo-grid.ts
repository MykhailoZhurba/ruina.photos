/* src/scripts/photo-grid.ts */
import PhotoSwipeLightbox from 'photoswipe/lightbox';

/**
 * Photo viewer: click/tap a photo to open it full screen.
 *
 * - Photos are scaled to fill the screen (upscaled if the screen is bigger than the photo).
 * - Zoom: click or double-tap, mouse wheel, pinch, or the + button. Drag to pan while zoomed.
 * - Swipe or use the arrow keys to move between photos; Esc, swipe down or the X to close.
 */
export function setupGallery() {
	const grid =
		typeof document === 'undefined' ? null : document.querySelector<HTMLElement>('#photo-grid');
	if (!grid) return;
	// Button labels in the page's language, set on the grid by PhotoGrid.astro.
	const labels = grid.dataset;

	const lightbox = new PhotoSwipeLightbox({
		gallery: '#photo-grid',
		children: 'a.pswp-item',
		pswpModule: () => import('photoswipe'),

		bgOpacity: 1,
		wheelToZoom: true,

		closeTitle: labels.lightboxClose ?? 'Close',
		zoomTitle: labels.lightboxZoom ?? 'Zoom',
		arrowPrevTitle: labels.lightboxPrev ?? 'Previous',
		arrowNextTitle: labels.lightboxNext ?? 'Next',
		errorMsg: labels.lightboxError ?? 'The image cannot be loaded',

		// "Contain" the photo in the screen: as large as possible without cropping.
		initialZoomLevel: (zoom) =>
			Math.min(
				(zoom.panAreaSize?.x ?? 1) / (zoom.elementSize?.x ?? 1),
				(zoom.panAreaSize?.y ?? 1) / (zoom.elementSize?.y ?? 1),
			),
		// One click / double-tap zooms to the photo's real pixels (or 2x for small photos)...
		secondaryZoomLevel: (zoom) => Math.max(1, zoom.initial * 2),
		// ...and pinch or the wheel can go a further 2x for fine detail.
		maxZoomLevel: (zoom) => zoom.secondary * 2,
	});

	// Caption from the photo's description in gallery.yaml (nothing is shown when it is empty).
	lightbox.on('uiRegister', () => {
		lightbox.pswp?.ui?.registerElement({
			name: 'custom-caption',
			order: 9,
			isButton: false,
			appendTo: 'root',
			onInit: (el, pswp) => {
				pswp.on('change', () => {
					const caption = pswp.currSlide?.data.element?.getAttribute('data-caption') ?? '';
					el.textContent = caption;
					el.hidden = !caption;
				});
			},
		});
	});

	lightbox.init();
}

if (typeof document !== 'undefined') {
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', setupGallery);
	} else {
		setupGallery();
	}
}
