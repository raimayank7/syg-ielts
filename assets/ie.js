/* IELTS Practice: overall band calculator (official rounding rule) and practice timer. Runs in the browser only. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  /* nearest half band; an average ending .25 goes up to the next half band and .75 up to the next whole band */
  function overall(avg) { return Math.floor(avg * 2 + 0.5) / 2; }
  var f1 = function (x) { return x.toFixed(1); };

  var bl = $('bc-l');
  if (bl) {
    var ids = ['l', 'r', 'w', 's'], names = { l: 'Listening', r: 'Reading', w: 'Writing', s: 'Speaking' }, out = $('bc-out'), bt = $('bt'), tout = $('bt-out');
    var run = function () {
      var vals = ids.map(function (k) { return $('bc-' + k).value; }), given = vals.filter(function (v) { return v !== ''; });
      if (given.length === 4) {
        var sum = vals.reduce(function (a, v) { return a + parseFloat(v); }, 0), avg = sum / 4, ov = overall(avg);
        out.hidden = false;
        out.innerHTML = '<h2>Overall band</h2><p class="big">' + f1(ov) + '</p><dl class="facts"><dt>Working</dt><dd>(' + vals.map(function (v) { return f1(+v); }).join(' + ') + ') ÷ 4 = ' + String(Math.round(avg * 1000) / 1000) + '</dd><dt>Rounded</dt><dd>' + f1(ov) +
          ' (nearest half band; .25 and .75 are rounded up)</dd><dt>Lowest section</dt><dd>' + f1(Math.min.apply(null, vals.map(Number))) + '. Many organisations also set a minimum for each section.</dd></dl>' +
          '<p class="ie-cta"><button class="btn sm" type="button" data-copy="IELTS: L ' + f1(+vals[0]) + ', R ' + f1(+vals[1]) + ', W ' + f1(+vals[2]) + ', S ' + f1(+vals[3]) + ' = overall ' + f1(ov) + '">Copy</button></p>';
      } else { out.hidden = true; }
      if (bt.value === '') { tout.hidden = true; return; }
      var target = parseFloat(bt.value);
      if (given.length === 4) { tout.hidden = false; tout.innerHTML = '<p>All four sections are filled in. Clear one of them to see what it would need to be for an overall ' + f1(target) + '.</p>'; return; }
      if (given.length !== 3) { tout.hidden = false; tout.innerHTML = '<p>Fill in exactly three sections above, leave the fourth on "Choose", and pick a target.</p>'; return; }
      var missing = ids[vals.indexOf('')], s3 = given.reduce(function (a, v) { return a + parseFloat(v); }, 0), need = null;
      for (var b = 0; b <= 9; b += 0.5) { if (overall((s3 + b) / 4) >= target) { need = b; break; } }
      tout.hidden = false;
      tout.innerHTML = need === null ? '<h2>Not reachable with these three scores</h2><p>Even a 9.0 in ' + names[missing] + ' gives an overall ' + f1(overall((s3 + 9) / 4)) + '. One of the other sections would have to be higher.</p>'
        : '<h2>' + names[missing] + ' needed</h2><p class="big">' + f1(need) + '</p><p>With ' + f1(need) + ' in ' + names[missing] + ' the average is ' + String(Math.round((s3 + need) / 4 * 1000) / 1000) + ', which gives an overall ' + f1(overall((s3 + need) / 4)) + '.' +
          (need > 0 ? ' With ' + f1(need - 0.5) + ' the overall would be ' + f1(overall((s3 + need - 0.5) / 4)) + '.' : '') + '</p>';
    };
    ids.forEach(function (k) { $('bc-' + k).addEventListener('change', run); }); bt.addEventListener('change', run);
  }

  var tm = $('tm');
  if (tm) {
    var clock = $('tm-c'), lab = $('tm-l'), note = $('tm-n'), go = $('tm-go'), total = 0, left = 0, endAt = 0, timer = null, running = false;
    var show = function () {
      var s = Math.max(0, Math.round(left)), m = Math.floor(s / 60), r = s % 60;
      clock.textContent = (m < 10 ? '0' : '') + m + ':' + (r < 10 ? '0' : '') + r;
      note.textContent = running && total >= 600 && left <= 300 && left > 0 ? 'Last five minutes: finish your sentence and start checking.' : (left <= 0 && total ? 'Time is up. Stop writing or speaking.' : '');
    };
    var beep = function () {
      try { var C = window.AudioContext || window.webkitAudioContext, c = new C(), o = c.createOscillator(), g = c.createGain(); o.connect(g); g.connect(c.destination); o.frequency.value = 660; g.gain.value = 0.15; o.start(); o.stop(c.currentTime + 0.6); } catch (e) { }
    };
    var stop = function () { clearInterval(timer); timer = null; running = false; go.textContent = left > 0 && left < total ? 'Resume' : 'Start'; };
    var tick = function () { left = (endAt - Date.now()) / 1000; if (left <= 0) { left = 0; stop(); tm.classList.add('ie-done'); beep(); } show(); };
    var set = function (min, name) { stop(); total = left = min * 60; lab.textContent = name + ': ' + min + ' minute' + (min === 1 ? '' : 's'); tm.classList.remove('ie-done'); go.textContent = 'Start'; show(); };
    $('tm-p').addEventListener('click', function (e) { var b = e.target.closest('[data-min]'); if (!b) return; $('tm-m').value = ''; set(+b.getAttribute('data-min'), b.getAttribute('data-lab')); });
    $('tm-m').addEventListener('input', function () { var v = parseInt(this.value, 10); if (/^\d+$/.test(this.value.trim()) && v >= 1 && v <= 240) set(v, 'Your own time'); });
    go.addEventListener('click', function () {
      if (running) { stop(); go.textContent = 'Resume'; return; }
      if (!total) { lab.textContent = 'Choose a time first'; return; }
      if (left <= 0) left = total;
      tm.classList.remove('ie-done'); endAt = Date.now() + left * 1000; running = true; go.textContent = 'Pause'; timer = setInterval(tick, 250); tick();
    });
    $('tm-rs').addEventListener('click', function () { stop(); left = total; tm.classList.remove('ie-done'); go.textContent = 'Start'; show(); });
  }
})();
