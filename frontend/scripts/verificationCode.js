document.addEventListener("DOMContentLoaded", () => {

const type = new URLSearchParams(window.location.search).get("type");

const email = new URLSearchParams(window.location.search).get("email");
document.getElementById("user-email").textContent = email;

});

  const inputs = document.querySelectorAll('.otp-input');
  const verifyBtn = document.getElementById('verify-btn');
  const resendBtn = document.getElementById('resend-btn');
  const formView  = document.getElementById('form-view');
  const successView = document.getElementById('success-view');

  // ── OTP navigation ──
  inputs.forEach((inp, i) => {
    inp.addEventListener('keydown', e => {
      if (e.key === 'Backspace' && !inp.value && i > 0) {
        inputs[i - 1].focus();
        inputs[i - 1].value = '';
        inputs[i - 1].classList.remove('filled');
        updateBtn();
      }
    });


inp.addEventListener('input', (e) => {
  let val = e.target.value.replace(/\D/g, '');

  if (val.length > 1) {
    val = val[0];
  }

  inp.value = val;
  inp.classList.toggle('filled', !!val);

  if (val && i < inputs.length - 1) {
    inputs[i + 1].focus();
  }

  updateBtn();
});

    inp.addEventListener('paste', e => {
      e.preventDefault();
      const data = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g,'');
      [...data].slice(0, 6).forEach((ch, j) => {
        if (inputs[i + j]) {
          inputs[i + j].value = ch;
          inputs[i + j].classList.add('filled');
        }
      });
      const next = Math.min(i + data.length, 5);
      inputs[next].focus();
      updateBtn();
    });

    inp.addEventListener('focus', () => inp.select());
  });

  function updateBtn() {
    const full = [...inputs].every(i => i.value);
      console.log("All filled:", full);
    verifyBtn.disabled = !full;
  }

  // ── Verify ──
verifyBtn.addEventListener('click', async function (e) {
  addRipple(e, this);

  const code = [...inputs].map(i => i.value).join('');
  verifyBtn.textContent = 'Verifying...';
  verifyBtn.disabled = true;

  try {
    const email = new URLSearchParams(window.location.search).get("email");
    const type = new URLSearchParams(window.location.search).get("type");

    // ========== حالة تغيير البريد الإلكتروني ==========
    if (type === "email-change") {
      const userId = new URLSearchParams(window.location.search).get("userId");
      const role = new URLSearchParams(window.location.search).get("role");
      const confirmUrl = role === 'searcher'
        ? `http://localhost:3000/searchers/confirm-email-change/${userId}`
        : `http://localhost:3000/donors/confirm-email-change/${userId}`;
      const confirmRes = await fetch(confirmUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verification_code: code })
      });
      if (!confirmRes.ok) {
        const errMsg = await confirmRes.text();
        throw new Error(errMsg);
      }
      await confirmRes.json();
      alert("Email updated successfully! Please log in again.");
      localStorage.removeItem("currentUserSession");
      window.location.href = "login.html";
      return;
    }

    // ========== التسجيل العادي ==========
    const url = type === "searcher"
      ? "http://localhost:3000/searchers/verify"
      : "http://localhost:3000/donors/verify";

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, verification_code: code })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Verification failed");
    }

    let userId, userName;
    if (type === "searcher") {
      userId = data.searcherId;
      userName = data.searcher.full_name;
    } else {
      userId = data.donorId;
      userName = data.donor.full_name;
    }

    localStorage.setItem("currentUserSession", JSON.stringify({
      userId: userId,
      userName: userName,
      userType: type
    }));

    formView.style.display = 'none';
    successView.classList.add('show');

    setTimeout(() => {
      if (type === "searcher") {
        window.location.href = "patient-profile.html";
      } else {
        window.location.href = "donor-profile.html";
      }
    }, 2000);

  } catch (err) {
    alert(err.message);
    verifyBtn.textContent = 'Verify';
    verifyBtn.disabled = false;
  }
});

  function addRipple(e, btn) {
    const r = document.createElement('span');
    r.className = 'ripple';
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    r.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size/2}px;top:${e.clientY - rect.top - size/2}px`;
    btn.appendChild(r);
    r.addEventListener('animationend', () => r.remove());
  }

  // ── Resend countdown ──
  resendBtn.addEventListener('click', () => {
    inputs.forEach(i => { i.value=''; i.classList.remove('filled'); });
    inputs[0].focus();
    updateBtn();
    let sec = 30;
    resendBtn.disabled = true;
    resendBtn.textContent = `Resend (${sec}s)`;
    const t = setInterval(() => {
      sec--;
      resendBtn.textContent = sec > 0 ? `Resend (${sec}s)` : 'Resend';
      if (sec <= 0) { clearInterval(t); resendBtn.disabled = false; }
    }, 1000);
  });

  // auto-focus first
  inputs[0].focus();
