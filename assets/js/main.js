(function () {
  'use strict';
  var C = window.KCSW || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- Contact details from config ---------- */
  var wa = (C.whatsapp || '').replace(/\D/g, '');
  if (wa && wa.indexOf('XXXX') === -1) {
    $$('[data-wa]').forEach(function (a) {
      var text = a.getAttribute('data-wa') === 'faq'
        ? 'Hello, I have a question about admissions'
        : 'Hello, I would like to know about admissions for 2026-27';
      a.href = 'https://wa.me/' + wa + '?text=' + encodeURIComponent(text);
    });
    $$('.lead__note').forEach(function (n) { n.hidden = true; });
  }
  if (C.phone) {
    $$('[data-tel]').forEach(function (a) {
      a.href = 'tel:' + C.phone.replace(/[^\d+]/g, '');
      var t = $('[data-tel-text]', a); if (t) t.textContent = C.phone;
    });
  }
  if (C.email) {
    $$('[data-mail]').forEach(function (a) {
      a.href = 'mailto:' + C.email;
      var t = $('[data-mail-text]', a); if (t) t.textContent = C.email;
    });
  }

  /* ---------- Menu sheet ---------- */
  var menu = $('#menu');
  var openBtn = $('#menu-open');
  function closeMenu() { if (menu && menu.open) menu.close(); document.documentElement.style.overflow = ''; }
  if (menu && typeof menu.showModal === 'function') {
    openBtn.addEventListener('click', function () { menu.showModal(); document.documentElement.style.overflow = 'hidden'; });
    $('#menu-close').addEventListener('click', closeMenu);
    menu.addEventListener('close', function () { document.documentElement.style.overflow = ''; });
    $$('a[href^="#"]', menu).forEach(function (a) { a.addEventListener('click', closeMenu); });
  } else if (openBtn) {
    openBtn.addEventListener('click', function () { location.hash = '#programs'; });
  }

  /* ---------- Language toggle ---------- */
  var T = {
    en: {
      h1a: 'Education that', h1b: 'serves.',
      sub: 'Social work education in Sevagram, Wardha, since 1993.',
      apply: 'Apply for 2026-27', view: 'View programs',
      programs: 'Social work programs', story: 'Social work college in Sevagram', admission: 'BSW and MSW admissions',
      notices: 'Notices', life: 'Life and field work', principal: "Principal's message",
      allNotices: 'All notices', readStory: 'Read our story',
      formTitle: 'Talk to the admission desk', formSub: 'Leave your number and we will call you back. [Call back time to be confirmed]',
      iam: 'I am interested in', name: 'Your name', mobile: 'Mobile number',
      submit: 'Request a call back', wa: 'Chat on WhatsApp'
    },
    mr: {
      h1a: 'शिक्षण जे', h1b: 'सेवा करते.',
      sub: 'सेवाग्राम, वर्धा येथे १९९३ पासून समाजकार्य शिक्षण.',
      apply: '२०२६-२७ साठी अर्ज करा', view: 'अभ्यासक्रम पहा',
      programs: 'अभ्यासक्रम', story: 'सेवाग्रामची कथा', admission: 'प्रवेश',
      notices: 'सूचना', life: 'जीवन आणि क्षेत्रकार्य', principal: 'प्राचार्यांचा संदेश',
      allNotices: 'सर्व सूचना', readStory: 'आमची कथा वाचा',
      formTitle: 'प्रवेश कक्षाशी बोला', formSub: 'तुमचा नंबर द्या, आम्ही परत फोन करू.',
      iam: 'मला यात रस आहे', name: 'तुमचे नाव', mobile: 'मोबाइल नंबर',
      submit: 'परत कॉल मिळवा', wa: 'व्हॉट्सअ‍ॅपवर बोला'
    }
  };
  function setLang(l) {
    var d = T[l] || T.en;
    document.documentElement.lang = l === 'mr' ? 'mr' : 'en';
    $$('[data-i18n]').forEach(function (el) { var k = el.getAttribute('data-i18n'); if (d[k]) el.textContent = d[k]; });
    $$('[data-lang]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-lang') === l)); });
    store.set('kcsw-lang', l);
  }
  $$('[data-lang]').forEach(function (b) { b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); }); });
  if (store.get('kcsw-lang') === 'mr') setLang('mr');

  /* ---------- Lead form ---------- */
  var form = $('#lead-form');
  if (form) {
    var name = $('#f-name'), phone = $('#f-phone');
    var eName = $('#err-name'), ePhone = $('#err-phone'), fail = $('#lead-fail');
    var busy = false;
    phone.addEventListener('input', function () { phone.value = phone.value.replace(/\D/g, '').slice(0, 10); });
    function check(showEmpty) {
      var okN = name.value.trim().length >= 2;
      var okP = /^[6-9]\d{9}$/.test(phone.value);
      eName.hidden = okN || !showEmpty; $('#fld-name').classList.toggle('bad', !okN && showEmpty);
      ePhone.hidden = okP || !showEmpty; $('#fld-phone').classList.toggle('bad', !okP && showEmpty);
      name.setAttribute('aria-invalid', String(!okN && showEmpty));
      phone.setAttribute('aria-invalid', String(!okP && showEmpty));
      return { ok: okN && okP, first: !okN ? name : (!okP ? phone : null) };
    }
    var tried = false;
    [name, phone].forEach(function (i) { i.addEventListener('blur', function () { if (tried) check(true); }); i.addEventListener('input', function () { if (tried) check(true); }); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (busy) return;
      tried = true;
      var r = check(true);
      if (!r.ok) { if (r.first) r.first.focus(); return; }
      if (form.company && form.company.value) return; /* honeypot */
      var prog = form.program.value;
      var payload = { name: name.value.trim(), phone: '+91' + phone.value, program: prog, page: location.href, lang: document.documentElement.lang, at: new Date().toISOString() };
      var btn = $('button[type=submit]', form);
      busy = true; btn.disabled = true; btn.style.opacity = '.7'; fail.hidden = true;
      var done = function () {
        $('#done-name').textContent = payload.name;
        $('#done-phone').textContent = phone.value;
        $('#done-prog').textContent = prog;
        form.hidden = true;
        var d = $('#lead-done'); d.hidden = false; d.focus({ preventScroll: true });
        if (window.gtag) window.gtag('event', 'generate_lead', { program: prog });
      };
      if (!C.leadEndpoint) { done(); return; }
      fetch(C.leadEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(payload) })
        .then(function (r) { if (!r.ok) throw new Error('bad status'); done(); })
        .catch(function () { fail.hidden = false; })
        .then(function () { busy = false; btn.disabled = false; btn.style.opacity = ''; });
    });
  }
})();
