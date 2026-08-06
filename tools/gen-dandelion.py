"""Regenera la cabeza del diente de león.

Todos los vilanos miden lo mismo; lo que cambia es hacia dónde apuntan. Se
muestrean direcciones uniformes sobre una esfera y se dibuja su proyección: el
que apunta al espectador se ve corto (escorzo) y grueso, el de canto se ve
entero y fino. Eso llena el disco sin anillos y sin pétalos disparejos.

Cada vilano es el mismo <use> rotado y escalado, así que la frondosidad no
engorda el archivo: el peso está en la plantilla, no en las instancias.

Uso: python3 tools/gen-dandelion.py  (reescribe la cabeza dentro de index.html).
Es idempotente: se puede correr las veces que haga falta tocando LAYERS para
subir o bajar la densidad. No forma parte de ningún build; index.html sigue
siendo el archivo de producción y se puede editar a mano.
"""
import math, random, re, pathlib

R_BASE, R_TIP = 14.0, 138.0
CX, CY = 250, 205

def barb(a_deg, L, bow=9):
    a, c = math.radians(a_deg), math.radians(a_deg + bow)
    ex, ey = R_TIP + L * math.cos(a), L * math.sin(a)
    cx, cy = R_TIP + 0.55 * L * math.cos(c), 0.55 * L * math.sin(c)
    return "M%s %sQ%s %s %s %s" % tuple(round(v, 1) for v in (R_TIP, 0, cx, cy, ex, ey))

def ray(bow, fan_rot):
    spoke = "M%s 0Q76 %s %s 0" % (R_BASE, bow, R_TIP)
    barbs = "".join(barb(a + fan_rot, 15 if abs(a) < 35 else 13)
                    for a in (-62, -41, -20.5, 0, 20.5, 41, 62))
    return '<path d="%s"/><path d="%s"/>' % (spoke, barbs)

VARIANTS = [(-9, -5), (5, 0), (-2, 4)]   # (curvatura del nervio, giro del abanico)
defs = ['<g id="dl-ray-%d">%s</g>' % (i + 1, ray(*v)) for i, v in enumerate(VARIANTS)]

# (clase, nº de vilanos, grosor, opacidad, rango de |z|) — |z| alto = apunta al
# espectador (corto y marcado); |z| bajo = de perfil, dibuja la silueta.
# El muestreo uniforme sobre la esfera concentra los vilanos en el borde (la
# proyección amontona los de canto), así que el interior se sobre-puebla a
# propósito: más bandas y más cuenta cuanto más al centro.
LAYERS = [("dl-l1", 88, 1.1, 0.45, (0.00, 0.51)),
          ("dl-l2", 66, 2.0, 0.65, (0.51, 0.835)),
          ("dl-l3", 36, 2.6, 0.80, (0.835, 0.940)),
          ("dl-l4", 24, 4.0, 0.70, (0.940, 0.990))]

rnd = random.Random(11)
layers = []
for cls, n, sw, op, (z0, z1) in LAYERS:
    step, uses = 360.0 / n, []
    for k in range(n):
        ang = (k + 0.5) * step + rnd.uniform(-step * 0.34, step * 0.34)
        z = rnd.uniform(z0, z1)
        uses.append('<use href="#dl-ray-%d" transform="translate(%d %d)rotate(%.1f)scale(%.3f)"/>'
                    % (rnd.choice((1, 2, 3)), CX, CY, ang % 360, math.sqrt(1 - z * z)))
    rows = ['\t\t\t\t\t\t\t\t\t' + "".join(uses[i:i + 5]) for i in range(0, len(uses), 5)]
    layers.append('\t\t\t\t\t\t\t\t<g class="%s" stroke-width="%s" opacity="%s">\n%s\n\t\t\t\t\t\t\t\t</g>'
                  % (cls, sw, op, "\n".join(rows)))

# ---- Vilanos sueltos en el aire -------------------------------------------
# Salen del borde de la flor hacia arriba y a la derecha; los desfases
# negativos los reparten por toda la trayectoria, así siempre hay unos cuantos
# a media travesía en vez de arrancar todos juntos.
N_FLY = 33
DUR = (15, 27)

def flyers(rnd):
    out = []
    for k in range(N_FLY):
        ang = math.radians(rnd.uniform(-86, 30))
        r = rnd.uniform(132, 205)
        x, y = CX + r * math.cos(ang), CY + r * math.sin(ang)
        dur = rnd.uniform(*DUR)
        out.append('<g transform="translate(%d %d)"><g class="dl-fly" style="--dur:%.0fs;--delay:-%.0fs">'
                   '<g class="dl-fly-y"><g class="dl-fly-w"><g class="dl-fly-r">'
                   '<use href="#dl-seed"/></g></g></g></g></g>'
                   % (x, y, dur, dur * k / N_FLY))
    return out

p = pathlib.Path(__file__).resolve().parent.parent / "index.html"
s = p.read_text()

# 1) Los vilanos que vuelan conservan su rampa por caja; #dl-grad pasa a
#    recorrer el vilano a lo largo, en coordenadas del propio rayo.
if 'dl-seed-grad' not in s:
    s, n = re.subn(r'<linearGradient id="dl-grad".*?</linearGradient>',
'''<linearGradient id="dl-seed-grad" x1="0" y1="1" x2="1" y2="0">
\t\t\t\t\t\t\t<stop offset="0%" stop-color="#6fd8bd"/>
\t\t\t\t\t\t\t<stop offset="45%" stop-color="#cdbcff"/>
\t\t\t\t\t\t\t<stop offset="100%" stop-color="#ffffff"/>
\t\t\t\t\t\t</linearGradient>
\t\t\t\t\t\t<!-- Recorre el vilano a lo largo (userSpaceOnUse en coordenadas del
\t\t\t\t\t\t     propio rayo): verde junto al corazón, blanco en la punta. -->
\t\t\t\t\t\t<linearGradient id="dl-grad" gradientUnits="userSpaceOnUse" x1="8" y1="0" x2="156" y2="0">
\t\t\t\t\t\t\t<stop offset="0%" stop-color="#57a795"/>
\t\t\t\t\t\t\t<stop offset="20%" stop-color="#8fd6c2"/>
\t\t\t\t\t\t\t<stop offset="50%" stop-color="#cdbcff"/>
\t\t\t\t\t\t\t<stop offset="100%" stop-color="#ffffff"/>
\t\t\t\t\t\t</linearGradient>''', s, flags=re.S)
    assert n == 1
    s = s.replace('<g id="dl-seed" stroke="url(#dl-grad)"', '<g id="dl-seed" stroke="url(#dl-seed-grad)"')

# 2) Plantilla del vilano (tres variantes, todas del mismo largo)
tpl = "".join('\\1%s\n' % d for d in defs)
if '<g id="dl-ray-1">' in s:
    s, n = re.subn(r'(\t*)<g id="dl-ray-1">.*?</g>\n(?:\t*<g id="dl-ray-\d">.*?</g>\n)*', tpl, s, flags=re.S)
else:
    s, n = re.subn(r'(\t*)(<g id="dl-seed")',
                   '\\1<!-- Vilano: siempre el mismo largo, solo cambia la curvatura del nervio -->\n'
                   + tpl + '\\1\\2', s)
assert n == 1

# 3) Capas nuevas en lugar de las viejas
head_start = s.index('<circle class="dl-fluff"')
head_start = s.index('\n', head_start) + 1
head_end = s.index('<ellipse class="dl-core"')
head_end = s.rindex('\t\t\t\t\t\t\t</g>\n', head_start, head_end)
s = s[:head_start] + "\n".join(layers) + "\n" + s[head_end:]
assert 'dl-fill' not in s and 'dl-layer-' not in s

# 4) Vilanos en el aire
fly = "\n".join('\t\t\t\t\t' + f for f in flyers(rnd))
s, n = re.subn(r'(<g class="dl-flyers">\n).*?(\n\t*</g>)', lambda m: m.group(1) + fly + m.group(2),
               s, flags=re.S)
assert n == 1

p.write_text(s)
print("vilanos: %d en la flor + %d en el aire | index.html: %.1f KB"
      % (sum(l[1] for l in LAYERS), N_FLY, len(s) / 1024))
