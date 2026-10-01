"""Une data/equipo/*.json y data/documentos/*.json en los índices que lee el sitio.

El panel guarda cada miembro y cada documento en su propio archivo, así crear
uno nuevo nunca pisa a otro. El sitio estático no puede listar una carpeta,
por eso este paso (lo corre GitHub Actions al publicar) arma un solo JSON.
Uso local:  python3 scripts/unir_datos.py
"""
import glob, json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def leer(carpeta):
    items = []
    for f in sorted(glob.glob(os.path.join(ROOT, 'data', carpeta, '*.json'))):
        with open(f, encoding='utf-8') as fh:
            items.append(json.load(fh))
    return items

def escribir(nombre, clave, items):
    with open(os.path.join(ROOT, 'data', nombre), 'w', encoding='utf-8') as fh:
        json.dump({clave: items}, fh, ensure_ascii=False, indent=2)

equipo = sorted(leer('equipo'), key=lambda m: (m.get('orden') or 999, m.get('nombre', '')))
docs = sorted(leer('documentos'), key=lambda d: str(d.get('fecha', '')), reverse=True)
escribir('equipo.json', 'miembros', equipo)
escribir('documentos.json', 'documentos', docs)
print('equipo: %d · documentos: %d' % (len(equipo), len(docs)))
