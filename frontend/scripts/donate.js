function setupFooterHover() {
    const socialIcons = [
        { selector: '.sm1-img', hover: 'images/hoverX.svg' },
        { selector: '.sm2-img', hover: 'images/hoverInst.svg' },
        { selector: '.sm3-img', hover: 'images/hoverFace.svg' }, 
        { selector: '.sm4-img', hover: 'images/hoverIn.svg' }
    ];

    socialIcons.forEach(icon => {
        const img = document.querySelector(icon.selector);
        
        if (img) {
            const originalSrc = img.src;

            img.onmouseenter = () => { img.src = icon.hover; };

            img.onmouseleave = () => { img.src = originalSrc; };
        }
    });
}
document.addEventListener('DOMContentLoaded', setupFooterHover);
