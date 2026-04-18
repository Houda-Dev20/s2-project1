document.addEventListener('DOMContentLoaded', () => {
    // 1. برمجة زر الرجوع
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                // إذا لم يكن هناك تاريخ للرجوع، اذهب للرئيسية كخيار بديل
                window.location.href = 'home.html';
            }
        });
    }})
