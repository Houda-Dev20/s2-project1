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
    const sm1Img = document.querySelector('.sm1-img');
    const sm2Img = document.querySelector('.sm2-img');
    const sm3Img = document.querySelector('.sm3-img');
    const sm4Img = document.querySelector('.sm4-img');
    
    if (sm1Img) {// Check if the image exists on the page
        const originalSrc1 = sm1Img.src;
        sm1Img.addEventListener('mouseenter', () => {
            sm1Img.src = 'images/Vector23.svg';
            
        });
        
        sm1Img.addEventListener('mouseleave', () => {
            sm1Img.src = originalSrc1;
            
        });
    }
    
    if (sm2Img) {
        const originalSrc2 = sm2Img.src;
        sm2Img.addEventListener('mouseenter', () => {
            sm2Img.src = 'images/Vector20.svg';
        });
        
        sm2Img.addEventListener('mouseleave', () => {
            sm2Img.src = originalSrc2;
            
        });
    }
    
    if (sm3Img) {
        const originalSrc3 = sm3Img.src;
        sm3Img.addEventListener('mouseenter', () => {
            sm3Img.src = 'images/Vector22.svg';
        });
        
        sm3Img.addEventListener('mouseleave', () => {
            sm3Img.src = originalSrc3;
        });
    }
    if (sm4Img) {
        const originalSrc4 = sm4Img.src;
        sm4Img.addEventListener('mouseenter', () => {
            sm4Img.src = 'images/Vector21.svg';
            
        });
        
        sm4Img.addEventListener('mouseleave', () => {
            sm4Img.src = originalSrc4;
        });
    }
});
