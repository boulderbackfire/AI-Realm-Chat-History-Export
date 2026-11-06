(function () {
  var SIZES = [64, 80, 100, 128, 160, 200];
  var DEF = { ly: 'card', ps: '80', sh: 'rounded', bd: 'speaker', dc: 'full' };
  var OPTS = {
    ly: { label: 'Layout', vals: ['card', 'simple'], names: ['Site style (cards)', 'Simple'] },
    ps: { label: 'Portrait size', vals: SIZES.map(String), names: SIZES.map(function (s) { return s + 'px'; }) },
    sh: { label: 'Shape', vals: ['rounded', 'circle'], names: ['Rounded square', 'Circle'] },
    bd: { label: 'Border', vals: ['speaker', 'gray', 'none'], names: ['Speaker color', 'Neutral gray', 'None'] },
    dc: { label: 'Dialogue', vals: ['full', 'name'], names: ['Full color', 'Name only'] }
  };
  var KEYS = ['ly', 'ps', 'sh', 'bd', 'dc'];
  var cur = {};
  function fromQuery(k) {
    var m = new RegExp('[?&]' + k + '=([^&#]*)').exec(location.search);
    return m ? decodeURIComponent(m[1]) : null;
  }
  function fromStore(k) { try { return localStorage.getItem('aiRealmView:' + k); } catch (e) { return null; } }
  KEYS.forEach(function (k) {
    var v = fromQuery(k);
    if (v === null || OPTS[k].vals.indexOf(v) < 0) v = fromStore(k);
    if (v === null || OPTS[k].vals.indexOf(v) < 0) v = DEF[k];
    if (OPTS[k].vals.indexOf(v) < 0) v = OPTS[k].vals[0];
    cur[k] = v;
  });
  function apply() {
    var h = document.documentElement;
    h.style.setProperty('--portrait-size', cur.ps + 'px');
    h.setAttribute('data-layout', cur.ly);
    h.setAttribute('data-shape', cur.sh);
    h.setAttribute('data-border', cur.bd);
    h.setAttribute('data-dlg', cur.dc);
  }
  window.withPs = function (u) {
    var h = u.indexOf('#'), hash = h >= 0 ? u.slice(h) : '', base = h >= 0 ? u.slice(0, h) : u;
    var q = base.indexOf('?'), path = q >= 0 ? base.slice(0, q) : base, kept = [];
    if (q >= 0) {
      base.slice(q + 1).split('&').forEach(function (p) { if (p && KEYS.indexOf(p.split('=')[0]) < 0) kept.push(p); });
    }
    KEYS.forEach(function (k) { kept.push(k + '=' + encodeURIComponent(cur[k])); });
    return path + '?' + kept.join('&') + hash;
  };
  function rewrite() {
    var as = document.querySelectorAll('a[href]');
    for (var i = 0; i < as.length; i++) {
      var h = as[i].getAttribute('href');
      if (/^chat-.*\.html|^index\.html/.test(h)) as[i].setAttribute('href', window.withPs(h));
    }
  }
  function build() {
    var host = document.getElementById('sizeCtl');
    if (!host) return;
    host.innerHTML = '';
    var wrap = document.createElement('span');
    wrap.className = 'view-ctl';
    KEYS.forEach(function (k) {
      var lab = document.createElement('label');
      lab.appendChild(document.createTextNode(OPTS[k].label + ' '));
      var sel = document.createElement('select');
      OPTS[k].vals.forEach(function (v, i) {
        var o = document.createElement('option');
        o.value = v; o.textContent = OPTS[k].names[i];
        if (v === cur[k]) o.selected = true;
        sel.appendChild(o);
      });
      sel.onchange = function () {
        cur[k] = sel.value;
        try { localStorage.setItem('aiRealmView:' + k, cur[k]); } catch (e) {}
        apply(); rewrite();
      };
      lab.appendChild(sel);
      wrap.appendChild(lab);
    });
    host.appendChild(wrap);
  }
  var od = document.querySelectorAll('details[open]');
  for (var j = 0; j < od.length; j++) od[j].removeAttribute('open');
  apply(); build(); rewrite();
})();
