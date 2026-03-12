const openBtn =document.getElementById("openModal");//to get join btn in home page
const donor =document.getElementById("closeModal1");//to get donor btn in home page
const searcher =document.getElementById("closeModal2");//to get searcher btn in home page
const modal =document.getElementById("modal");//to get popup id in home page
const closeBtn=document.getElementById("closeModel");//to get cross btn in homepage
const login=document.getElementById("log-in");//to get login btn in home page

login.addEventListener("click", () => {
    window.location.href = "http://127.0.0.1:5500/logIn.html"; 
});

openBtn.addEventListener("click",()=>{
 modal.classList.add("open");
});
donor.addEventListener("click", () => {
    window.location.href = "http://127.0.0.1:5500/donor-signup.html"; 
});
searcher.addEventListener("click", () => {
    window.location.href = "http://127.0.0.1:5500/request-blood.html"; 
});
closeBtn.addEventListener("click",()=>{
 modal.classList.remove("open");
});

document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop() ;
    
    document.querySelectorAll('.taps').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
});


    
    document.addEventListener('DOMContentLoaded', function() {
        const statistics = document.querySelectorAll('.statistics');
        // Create a new IntersectionObserver - this is a browser feature that watches elements
        // and tells us when they become visible or hidden in the viewport
        // The callback function runs whenever the visibility of any watched element changes
        const observer = new IntersectionObserver((entries) => {
            // 'entries' is an array of all elements that just changed visibility
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Element is visible in viewport
                    entry.target.classList.add('visible');
                } else {
                    // Element is not visible in viewport
                    entry.target.classList.remove('visible');
                }
            });
        }, {
            threshold: 0.2,  // Element is considered visible when 30% is in view
            rootMargin: '0px'  // No margin
        });
        
        // Observe each statistics card
        statistics.forEach(card => {
            // Tell the observer to start watching this specific card
            // The observer will now monitor this card(div) and trigger the callback
            // whenever its visibility changes
            observer.observe(card);
        });
        
    });
const donor1 =document.getElementById("donor1");//to get donor btn in home page2
donor1.addEventListener("click", () => {
    window.location.href = "http://127.0.0.1:5500/donor-signup.html"; 
});



    document.addEventListener('DOMContentLoaded', function() {
        const images = document.querySelectorAll('.sm-img');
        const hoverImages = [
            'images/Vector11.svg',
            'images/Vector19.svg', 
            'images/Vector12.svg',
            'images/Vector15.svg'
        ];
        
        images.forEach((img, index) => {
            const original = img.src;
            
            img.addEventListener('mouseenter', () => {
                img.src = hoverImages[index];
                 img.style.transform = 'scale(0.9)';
            });
            
            img.addEventListener('mouseleave', () => {
                img.src = original;
                img.style.transform = 'scale(1)'
            });
        });
    });
