document.addEventListener('DOMContentLoaded', () => {

    // Accordion behavior (optional — since yours is always open now)
    const items = document.querySelectorAll('.accordion-item');

    items.forEach(item => {
        const header = item.querySelector('.accordion-header');

        if (!header) return;

        header.addEventListener('click', () => {
            const content = item.querySelector('.accordion-content');

            // Toggle visibility (only if you want collapsible behavior)
            if (content.style.display === 'none') {
                content.style.display = 'block';
            } else {
                content.style.display = 'none';
            }
        });
    });

});