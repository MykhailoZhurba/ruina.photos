/* src/scripts/photo-grid.ts */
import GLightbox from 'glightbox';

export function setupGallery() {
	if (typeof document === 'undefined') return;

	// Just initialize the Lightbox. 
    // Do NOT include any positioning math here.
	GLightbox({
		selector: '.glightbox',
		touchNavigation: true,
		loop: true,
		zoomable: true,
		draggable: true,
		openEffect: 'zoom',
		closeEffect: 'fade',
	});
}

if (typeof window !== 'undefined') {
	document.addEventListener('DOMContentLoaded', setupGallery);
}