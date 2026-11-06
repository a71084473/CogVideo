(function () {
  const form = document.getElementById('order-form');
  const tbody = document.querySelector('#items tbody');
  const tpl = document.getElementById('row-tpl');
  const $ = (id) => document.getElementById(id);
  const fmt = (n) => 'NT$ ' + Math.round(n).toLocaleString('en-US');
  let avail = {};

  function days() {
    const s = new Date($('rental_start').value), e = new Date($('rental_end').value);
    if (isNaN(s) || isNaN(e) || e < s) return 0;
    return Math.round((e - s) / 86400000) + 1;
  }

  async function loadAvail() {
    const s = $('rental_start').value, e = $('rental_end').value;
    if (!s || !e || e < s) { avail = {}; recalc(); return; }
    const ex = form.dataset.exclude ? '&exclude=' + form.dataset.exclude : '';
    try {
      const r = await fetch(`/api/availability?start=${s}&end=${e}${ex}`);
      avail = r.ok ? await r.json() : {};
    } catch (_) { avail = {}; }
    recalc();
  }

  function recalc() {
    const d = days();
    $('days').textContent = d;
    let grand = 0;
    const need = {};
    tbody.querySelectorAll('tr').forEach((tr) => {
      const id = tr.querySelector('.eq').value;
      if (id) need[id] = (need[id] || 0) + (parseInt(tr.querySelector('.qty').value) || 0);
    });
    tbody.querySelectorAll('tr').forEach((tr) => {
      const sel = tr.querySelector('.eq');
      const opt = sel.selectedOptions[0];
      const qty = parseInt(tr.querySelector('.qty').value) || 0;
      if (!sel.value) {
        tr.querySelector('.avail').textContent = '-';
        tr.querySelector('.price').textContent = '-';
        tr.querySelector('.sub').textContent = '-';
        tr.classList.remove('over');
        return;
      }
      const price = parseInt(opt.dataset.price) || 0;
      const left = avail[sel.value];
      const cell = tr.querySelector('.avail');
      cell.textContent = left === undefined ? '…' : left + ' / ' + opt.dataset.total;
      tr.classList.toggle('over', left !== undefined && need[sel.value] > left);
      tr.querySelector('.price').textContent = fmt(price);
      const sub = price * qty * d;
      tr.querySelector('.sub').textContent = fmt(sub);
      grand += sub;
    });
    $('grand').textContent = fmt(grand);
  }

  function addRow(item) {
    const tr = tpl.content.firstElementChild.cloneNode(true);
    if (item) {
      tr.querySelector('.eq').value = item.equipment_id;
      tr.querySelector('.qty').value = item.qty;
    }
    tr.querySelector('.del').onclick = () => { tr.remove(); recalc(); };
    tr.querySelector('.eq').onchange = recalc;
    tr.querySelector('.qty').oninput = recalc;
    tbody.appendChild(tr);
  }

  // 依出租日期自動帶入預設取貨/歸還時間
  function syncTimes(force) {
    const s = $('rental_start').value, e = $('rental_end').value;
    if (s && (force || !$('pickup_at').value)) $('pickup_at').value = s + 'T10:00';
    if (e && (force || !$('return_at').value)) $('return_at').value = e + 'T18:00';
  }
  $('rental_start').addEventListener('change', () => {
    if ($('rental_end').value < $('rental_start').value) $('rental_end').value = $('rental_start').value;
    syncTimes(!form.dataset.exclude); loadAvail();
  });
  $('rental_end').addEventListener('change', () => { syncTimes(!form.dataset.exclude); loadAvail(); });
  $('add-row').onclick = () => { addRow(); recalc(); };

  // ---- 貼上預約文字 → 自動填入
  const pasteBtn = $('paste-parse');
  if (pasteBtn && window.parseBooking) {
    const equipment = [...tpl.content.querySelectorAll('.eq option')].filter((o) => o.value)
      .map((o) => ({ id: o.value, name: o.textContent.split('｜').pop() }));
    const fieldEl = (k) => form.elements[k];
    const LABEL = { company: '公司名', contact: '聯絡人', email: '信箱', phone: '電話', rental_start: '出租起日',
      rental_end: '出租迄日', pickup_at: '取貨時間', return_at: '歸還時間', note: '備註', channel: '社群管道' };
    pasteBtn.onclick = () => {
      const text = $('paste-text').value;
      const out = $('paste-result');
      if (!text.trim()) { out.textContent = '請先貼上預約文字'; return; }
      const r = window.parseBooking(text, equipment, ((d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`)(new Date()));
      form.querySelectorAll('.autofilled').forEach((el) => el.classList.remove('autofilled'));
      const filled = [];
      Object.entries(r.fields).forEach(([k, v]) => {
        const el = fieldEl(k);
        if (!el || !v) return;
        el.value = v; el.classList.add('autofilled'); filled.push(LABEL[k]);
      });
      if (r.items.length) {
        tbody.innerHTML = '';
        r.items.forEach((i) => addRow({ equipment_id: i.equipment_id, qty: i.qty }));
        tbody.querySelectorAll('select, input').forEach((el) => el.classList.add('autofilled'));
        filled.push(`設備 ${r.items.length} 項`);
      }
      const missing = Object.keys(LABEL).filter((k) => k !== 'note' && !fieldEl(k).value).map((k) => LABEL[k]);
      out.innerHTML = '';
      const parts = [filled.length ? `已填入：${filled.join('、')}` : '沒有辨識到可填入的內容'];
      if (missing.length) parts.push(`未辨識到：${missing.join('、')}`);
      if (r.unmatched.length) parts.push(`找不到對應設備：${r.unmatched.join('、')}`);
      out.textContent = parts.join('　');
      loadAvail();
    };
    form.addEventListener('input', (e) => e.target.classList.remove('autofilled'));
    $('paste-clear').onclick = () => { $('paste-text').value = ''; $('paste-result').textContent = ''; };
  }

  (window.INITIAL_ITEMS.length ? window.INITIAL_ITEMS : [null]).forEach(addRow);
  syncTimes(false);
  loadAvail();
})();
