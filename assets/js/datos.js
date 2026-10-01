/* VM Legal · Contenido editable desde el panel (admin/).
   El panel guarda data/equipo.json y data/documentos.json en el repositorio;
   aquí se pintan antes de que sitio.js arme carruseles, desplegables y filtros.
   window.VMdatos es la promesa que sitio.js espera. */
(function () {
  'use strict';

  var CHEV = '<svg class="chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
  var OUT  = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>';
  var AREAS = { tributario: 'Tributario', societario: 'Societario', cambiario: 'Cambiario', aduanero: 'Aduanero' };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // El panel guarda rutas como "/uploads/x.pdf"; se vuelven relativas para que
  // sirvan igual en GitHub Pages (subcarpeta) y en el dominio definitivo.
  function src(p) {
    p = String(p || '');
    return /^https?:\/\//.test(p) ? p : p.replace(/^\/+/, '');
  }

  function initials(name) {
    return name.split(/\s+/).filter(function (w) { return /^[A-ZÁÉÍÓÚÑ]/.test(w); })
      .slice(0, 2).map(function (w) { return w[0]; }).join('');
  }

  function fecha(iso) {
    var d = new Date(iso + 'T12:00:00');
    return isNaN(d) ? esc(iso) : d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  function load(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error(url + ' → ' + r.status);
      return r.json();
    });
  }

  function team(track) {
    return load('data/equipo.json').then(function (d) {
      track.innerHTML = (d.miembros || []).map(function (m, i) {
        var id = 'bio-' + i;
        var avatar = m.foto
          ? '<img class="member__photo" src="' + esc(src(m.foto)) + '" alt="" width="112" height="112" loading="lazy">'
          : '<span class="member__avatar" aria-hidden="true">' + esc(initials(m.nombre)) + '</span>';
        var edu = '';
        if (m.pregrado) edu += '<li><b>Pregrado</b>' + esc(m.pregrado) + '</li>';
        if (m.posgrado) edu += '<li><b>Posgrado</b>' + esc(m.posgrado) + '</li>';
        var bio = m.perfil
          ? '<div class="disclose"><button class="disclose__trigger" type="button" aria-expanded="false" aria-controls="' + id + '">' +
            '<span data-i18n-skip>Ver perfil</span>' + CHEV + '</button>' +
            '<div class="disclose__panel" id="' + id + '"><div class="disclose__inner"><p>' + esc(m.perfil) + '</p></div></div></div>'
          : '';
        return '<li class="carousel__item"><article class="member">' + avatar +
          '<h3>' + esc(m.nombre) + '</h3>' +
          (m.cargo ? '<p class="member__role">' + esc(m.cargo) + '</p>' : '') +
          (edu ? '<ul class="member__edu">' + edu + '</ul>' : '') +
          bio + '</article></li>';
      }).join('');
    });
  }

  function docs(list) {
    return load('data/documentos.json').then(function (d) {
      var items = (d.documentos || []).slice().sort(function (a, b) {
        return String(b.fecha).localeCompare(String(a.fecha));
      });
      list.innerHTML = items.map(function (c) {
        var area = AREAS[c.area] ? c.area : 'tributario';
        var tags = (c.palabras_clave || []).filter(Boolean);
        return '<li class="circular reveal' + (c.destacado ? ' is-featured' : '') + '" data-area="' + area + '">' +
          '<div class="circular__meta"><span class="tag tag--' + area + '">' + AREAS[area] + '</span>' +
          '<time datetime="' + esc(c.fecha) + '">' + fecha(c.fecha) + '</time></div>' +
          '<h3>' + esc(c.titulo) + '</h3>' +
          (c.descripcion ? '<p>' + esc(c.descripcion) + '</p>' : '') +
          (tags.length ? '<ul class="area__tags">' + tags.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' : '') +
          (c.archivo ? '<a class="circular__link" href="' + esc(src(c.archivo)) + '" target="_blank" rel="noopener">Ver documento (PDF)' + OUT + '</a>' : '') +
          '</li>';
      }).join('');
    });
  }

  var jobs = [];
  var track = document.getElementById('teamTrack');
  var list  = document.getElementById('circulars');
  if (track) jobs.push(team(track));
  if (list) jobs.push(docs(list));

  // Un fallo de red no debe dejar el resto del sitio sin interacciones.
  window.VMdatos = Promise.all(jobs).catch(function (e) { console.error(e); });
})();
