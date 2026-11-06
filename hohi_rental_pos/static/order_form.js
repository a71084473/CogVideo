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

  (window.INITIAL_ITEMS.length ? window.INITIAL_ITEMS : [null]).forEach(addRow);
  syncTimes(false);
  loadAvail();
})();
