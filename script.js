(() => {
    'use strict';
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => [...r.querySelectorAll(s)]; 
    const money = n => 'GH₵' + n.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const EMAIL = 'nefifrancis@gmail.com';
    const el = (tag, cls, text) => {const e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; };

    const io = 'IntersectionObserver' in window 
    ? new IntersectionObserver((es, o) => es.forEach(e => { if (e.isIntersecting) {e.target.classList.add('visible'); o.unobserve(e.target); } }), { threshold: 0.1 }) : null;
const watch = n => io ? io.observe(n) : n.classList.add('visible');
$$('.reveal').forEach(watch);

$$('.accordion-btn').forEach(btn => btn.addEventListener('click', () => {
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    panel.style.maxHeight = open ? '0' : panel.scrollHeight + 'px';
}))

$$('.tabs').forEach(tabs => {
    const btns = $$('[role=tab]', tabs), panels = $$('[role=tabpanel]', tabs);
    btns.forEach(b => b.addEventListener('click', () => {
        btns.forEach(x => x.setAttribute('aria-selected', String(x === b)));
        panels.forEach(p => { p.hidden = p.id !== b.getAttribute('aria-controls');});
    }));
});

const shots = $$('.gallery img');
if (shots.length) {
    const lb = el('div', 'lightbox');
    lb.hidden = true; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Image viewer');
    lb.innerHTML = '<button class="lb-close" aria-label="Close">&times;</button><button class="lb-prev" aria-label="Previous image">&#8249;</button><figure><img alt=""><figcaption></figcaption></figure><button class="lb-next" aria-label="Next image">&#8250;</button>';
    document.body.appendChild(lb);
    let i = 0;
    const show = n => { i = (n + shots.length) % shots.length; $('img', lb).src = shots[i].src; $('img', lb).alt = shots[i].alt; $('figcaption', lb).textContent = shots[i].alt; }
    const open = n => {show(n); lb.hidden = false; document.body.classList.add('no-scroll'); $('.lb-close', lb).focus(); };
    const close = () => { lb.hidden = true; document.body.classList.remove('no-scroll'); };
    shots.forEach((g, n) => {g.tabIndex = 0; g.addEventListener('click', () => open(n)); g.addEventListener('keydown', e => { if (e.key === 'Enter') open(n); }); });
    $('.lb-close', lb).onclick = close; $('.lb-prev', lb).onclick = () => show(i - 1); $('.lb-next', lb).onclick =  () => show(i + 1);
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    document.addEventListener('keydown', e => {
        if (lb.hidden) return;
        if (e.key === 'Escape') close(); if (e.key === 'ArrowLeft') show(i - 1); if (e.key === 'ArrowRight') show(i + 1);
    });
}

const list = $('#product-list');
if (list && typeof PRODUCTS !== 'undefined') {
    const q = $('#search'), cat = $('#category'), sort = $('#sort'), count = $('#result-count'), modal = $('#product-modal');
    [...new Set(PRODUCTS.map(p => p.category))].sort(). forEach(c => cat.add(new Option(c, c)));
    const low = p => Math.min(...p.prices.map(x => x.amount));

    const openModal = p => {
        modal.replaceChildren();
            const close = el('button', 'modal-close', 'x'); close.setAttribute('aria-label', 'Close'); close.onclick = () => modal.close();
            const img = el('img'); img.src = p.image; img.alt = p.name; img.width = 200; img.height = 200;
            const title = el('h2', '', p.name); title.id = 'modal-title';
            const ul = el('ul', 'price-list');
            p.prices.forEach(x => ul.appendChild(el('li', 'price', money(x.amount) + '' + x.unit)));
            const link = el('a', 'cta-button', 'Enquire about this product'); link.href = 'enquiry.html?product=' + encodeURIComponent(p.name);
            modal.append(close, img, title, el('p', 'meta', p.category), el('p', '', p.description), ul, link);
        modal.showModal();
    };
    modal.addEventListener('click', e => {if (e.target === modal) modal.close(); });

    const card = p => {
        const a = el('article', 'card reveal'); a.tabIndex = 0;
        const img = el('img'); img.src = p.image; img.alt = p.name; img.loading = 'lazy'; img.width = 150; img.height = 150;
        a.append(img, el('h3', '', p.name), el('p', '', p.description));
        p.prices.forEach(x => a.appendChild(el('p', 'price', money(x.amount) + ' ' + x.unit)));
        a.appendChild(el('span', 'tag', 'View details →'));
        a.addEventListener('click', () => openModal(p));
        a.addEventListener('keydown', e => { if (e.key === 'Enter') openModal(p); });
        return a;    
    };

    const render = () => {
        const term = q.value.trim().toLowerCase(), s = sort.value;
        const items = PRODUCTS
        .filter(p => (!cat.value || p.category === cat.value) && (p.name + ' ' + p.description + ' ' + p.category).toLowerCase().includes(term))
    .sort ((a, b) => s === 'price-asc' ? low(a) - low(b) : s === 'price-desc' ? low(b) - low(a) : a.name.localeCompare(b.name));
    list.replaceChildren(...items.map(card));
    if (!items.length) list.appendChild(el('p', '', 'No products match your search. Try a different word or category.'));
    count.textContent = items.length +  ' product' + (items.length === 1 ? '' : 's') + ' found';
    $$('.card', list).forEach(watch);
    };
    [q, cat, sort].forEach(c => c.addEventListener('input', render));
    render();
}

const setError = (f, msg) => {
    const box = document.getElementById(f.id + '-error'); if (box) box.textContent = msg;
    f.classList.toggle('invalid', !!msg); f.setAttribute('aria-invalid', String(!!msg)); return !msg;
};
const check = {
    name: v => /^[A-Za-z][A-Za-z\s'.-]{1,59}$/.test(v.trim()) ? '' : 'Enter your full name (letters only, 2-60 characters).',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Enter a valid email, e.g. nestar@gmail.com.',
    phone: v => /^\+?\d{7,15}$/.test(v.replace(/[\s().-]/g, '')) ? '' : 'Enter a valid phone number',
    select: v => v ? '' : 'Please select an option.',
    qty: v => Number.isInteger(+v) && +v >= 1 && +v <= 10000 ? '' : 'Enter a whole number from 1 to 10 000.',
    date: v => { if (!v) return 'Please choose a date.'; const d = new Date(v), t = new Date(); t.setHours(0, 0, 0, 0,); return d >= t ? '' : 'The date cannot be in the past.'; },
    msg: v => v.trim().length >= 10 && v.length <= 500 ? '' : 'Message must be 10-500 characters.',
};
const bind = (form, rules, onValid) => {
    const run = id => {const f = document.getElementById(id); return setError(f, rules[id](f.value)); };
    Object.keys(rules).forEach(id => { const f = document.getElementById(id); f.addEventListener('blur', () => run(id)); f.addEventListener('input', () => f.classList.contains('invalid') && run(id)); });
    form.addEventListener('submit', e => {
        e.preventDefault();
        const bad = Object.keys(rules).filter(id => !run(id));
        if (bad.length) {document.getElementById(bad[0]).focus(); return;}
        onValid();
    });
};
const counter = () => { const m = $('#message'), c = $('#msg-count'); if (m && c) {
    const u = () => { c.textContent = m.value.length + ' /500';}; m.addEventListener('input', u); u(); } };
    counter();

    const eForm = $('#enquiry-form');
    if (eForm && typeof PRODUCTS !== 'undefined') {
        const prod = $('#product'), opt = $('#priceOption'), res = $('#enquiry-result');
        PRODUCTS.forEach((p, n) => prod.add(new Option(p.category + ' - ' + p.name, n)));
        const fill = () => {
            opt.length = 1; const p = PRODUCTS[prod.value];
            opt.options[0].text = p ? 'Select an option' : 'Select a product first';
            if (p) p.prices.forEach((x, n) => opt.add(new Option(money(x.amount) + '' + x.unit, n)));
            if (p && p.prices.length === 1) opt.value = 0;
        };
        prod.addEventListener('change', fill);
        const pre = new URLSearchParams(location.search).get('product');
        if (pre) { const n = PRODUCTS.findIndex(p => p.name === pre); if (n > -1) { prod.value = n; fill(); }}
        $('#neededBy').min = new Date().toISOString().split('T')[0];

        bind(eForm, {fullName: check.name, email: check.email, phone: check.phone, enquiryType: check.select, product: check.select, priceOption: check.select, quantity: check.qty, neededBy: check.date}, () => {
            const p = PRODUCTS[prod.value], x = p.prices[opt.value], qty = +$('#quantity').value, total = x.amount * qty;
            res.replaceChildren(el('h3', '', 'Thank you, ' + $('#fullName').value.trim().split(' ')[0] + '!'),
        el('p','', 'Estimate: ' + qty + ' x ' + p.name + ' (' + x.unit + ') =  ' + money(total)),
        el('p', '', 'Availability: subject to stock. Our team will confirm availability and final price by phone or email.'),
        ...(qty >= 50 ? [el('p', '', 'For large orders like this, ask us abut a bulk quote.')] : []));
        const status = el('p', 'meta', 'Sending your enquiry...'); res.appendChild(status); res.hidden = false; res.scrollIntoView({behavior: 'smooth'});
        fetch(eForm.dataset.ajax, {method: 'POST', headers: {Accept: 'application/json'}, body: new FormData(eForm) })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(() => {status.textContent = 'Your enquiry has been sent to Francopuma.'; eForm.reset(); fill(); counter(); })
        .catch(() => {status.textContent = 'We could not send your enquiry automatically. Please call +233 242 425 416 or email ' + EMAIL + '.';});        
        });
        }

        const cForm = $('#contact-form');
        if (cForm) {
            bind(cForm, {name: check.name, email: check.email, phone: check.phone, messageType: check.select, message: check.msg}, () => {
                const v = id => document.getElementById(id).value.trim();
                const subject = '[' + v('messageType') + '] Message from ' + v('name');
                const body = 'Name: ' + v('name') + '\nEmail: ' + v('email') + '\nPhone: ' + v('phone') + '\nType: ' + v('messageType') + '\n\n' + v('message');
                $('#email-text').textContent = 'To: ' + EMAIL + '\nSubject: ' + subject + '\n\n' + body;
                $('#send-email').href = 'mailto:' +  EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
                const box = $('#email-preview'); box.hidden = false; box.scrollIntoView({behavior: 'smooth'});
            });
        }

        const mapBox = $('#map');
        if (mapBox) {
            const init = () => {
                const branches = [
                    {name: 'Dzodze branch', note: 'Dzodze to Akasi road, near A-Plaza Hotel', pos: [6.2530, 0.9910]},
                    {name: 'Abor branch', note: 'Abor to Afife road, Detsideke', pos: [6.0300, 0.9500]},
                ];
                const map = L.map('map');
                L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom: 19, attribution: '&copy; OpenStreetMap contributors'}).addTo(map);
                branches.forEach(b => L.marker(b.pos).addTo(map).bindPopup('<strong>' + b.name + '</strong><br>' + b.note));
                map.fitBounds(branches.map(b => b.pos), {padding: [40, 40]});
            };
            window.L ? init() : window.addEventListener('load', () => window.L && init());
        }
}) ();
