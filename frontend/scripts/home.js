const openBtn = document.getElementById("openModal"); // join btn
const donor = document.getElementById("closeModal1"); // donor btn
const searcher = document.getElementById("closeModal2"); // searcher btn
const modal = document.getElementById("modal");
const closeBtn = document.getElementById("closeModel");
const login = document.getElementById("log-in");

login.addEventListener("click", () => {
    window.location.href = "http://127.0.0.1:5500/logIn.html";
});

openBtn.addEventListener("click", () => {
    modal.classList.add("open");
});
donor.addEventListener("click", () => {
    window.location.href = "http://127.0.0.1:5500/donor-signup.html";
});
searcher.addEventListener("click", () => {
    window.location.href = "http://127.0.0.1:5500/request-blood.html";
});
closeBtn.addEventListener("click", () => {
    modal.classList.remove("open");
});

document.addEventListener('DOMContentLoaded', function () {
    const currentPage = window.location.pathname.split('/').pop();

    document.querySelectorAll('.taps').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const statistics = document.querySelectorAll('.statistics');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                entry.target.classList.remove('visible');
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px'
    });

    statistics.forEach(card => {
        observer.observe(card);
    });
});

const donor1 = document.getElementById("donor1");
donor1.addEventListener("click", () => {
    window.location.href = "http://127.0.0.1:5500/donor-signup.html";
});

document.addEventListener('DOMContentLoaded', function () {
    const sm1Img = document.querySelector('.sm1-img');
    const sm2Img = document.querySelector('.sm2-img');
    const sm3Img = document.querySelector('.sm3-img');
    const sm4Img = document.querySelector('.sm4-img');

    if (sm1Img) {
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

// ======================== إضافة جزء جلب الإحصائيات ========================

async function fetchStats() {
    try {
        // تأكد من أن الرابط صحيح حسب تشغيل الخادم الخلفي
const response = await fetch('http://localhost:3000/admin/stats');        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // تحديث العناصر في الصفحة (تأكد من وجود هذه الـ IDs في HTML)
        const weekEl = document.getElementById('livesSavedWeek');
        const monthEl = document.getElementById('livesSavedMonth');
        const donorsConnectedEl = document.getElementById('donorsConnected');

        if (weekEl) weekEl.textContent = data.livesSavedWeek ?? 0;
        if (monthEl) monthEl.textContent = data.livesSavedMonth ?? 0;
        if (donorsConnectedEl) donorsConnectedEl.textContent = data.totalDonors ?? 0;

        // (اختياري) يمكنك تحديث إحصائيات أخرى مثل totalSearchers إن وجدت
        console.log('Stats updated:', data);
    } catch (error) {
        console.error('Failed to load statistics:', error);
        // عرض قيم بديلة عند الخطأ
        const weekEl = document.getElementById('livesSavedWeek');
        const monthEl = document.getElementById('livesSavedMonth');
        const donorsConnectedEl = document.getElementById('donorsConnected');
        if (weekEl) weekEl.textContent = '--';
        if (monthEl) monthEl.textContent = '--';
        if (donorsConnectedEl) donorsConnectedEl.textContent = '--';
    }
}

// استدعاء الجلب عند تحميل الصفحة، وتكراره كل دقيقة (اختياري)
document.addEventListener('DOMContentLoaded', () => {
    fetchStats();
    // تحديث الإحصائيات كل 60 ثانية (يمكنك إلغاؤه أو تغيير المدة)
    setInterval(fetchStats, 60000);
});