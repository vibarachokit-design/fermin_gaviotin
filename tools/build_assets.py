"""Prepara los assets del juego a partir del kit de arte (PNG procesados).

Uso:  python tools/build_assets.py   (desde la carpeta juego)
Salida: assets/ (fondos y pantallas en WebP, sprites en PNG) + assets/items.json
"""
from pathlib import Path
import json, shutil
import numpy as np
from PIL import Image
from scipy import ndimage

GAME = Path(__file__).resolve().parent.parent
KIT = GAME.parent / 'Gaviotin_Arte_Kit' / 'PNG'
OUT = GAME / 'assets'
H = 720


def out(rel):
    p = OUT / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    return p


def unroll(im):
    """El kit desplazó los fondos media imagen; se restaura el original (el juego los repite en espejo)."""
    a = np.asarray(im)
    return Image.fromarray(np.roll(a, -a.shape[1] // 2, axis=1), im.mode)


def key_white(im):
    a = np.asarray(im.convert('RGBA')).astype(np.float32)
    lo = a[..., :3].min(axis=2)
    alpha = np.clip((250 - lo) / 25, 0, 1)
    a[..., 3] = np.minimum(a[..., 3], alpha * 255)
    return Image.fromarray(a.astype(np.uint8), 'RGBA')


def backgrounds():
    for p in sorted((KIT / '04_Fondos').rglob('*.png')):
        im = unroll(Image.open(p).convert('RGBA'))
        if p.name.startswith('14_'):
            im = key_white(im)
        im = im.resize((round(im.width * H / im.height), H), Image.Resampling.LANCZOS)
        name = p.stem.split('_3840')[0]
        im.save(out(f'bg/{name}.webp'), 'WEBP', quality=86, method=6)
    for p in sorted((KIT / '05_Pantallas').glob('*.png')):
        im = Image.open(p).convert('RGB').resize((1280, 720), Image.Resampling.LANCZOS)
        im.save(out(f'screens/{p.stem.split("_1920")[0]}.webp'), 'WEBP', quality=86, method=6)


def split(src, rows, names, dilate=10):
    """Separa una lámina de objetos sueltos; rows = cantidad de objetos por fila."""
    im = Image.open(KIT / src).convert('RGBA')
    a = np.asarray(im)
    mask = a[..., 3] > 25
    lab, n = ndimage.label(ndimage.binary_dilation(mask, iterations=dilate))
    objs = ndimage.find_objects(lab)
    areas = ndimage.sum(mask, lab, index=np.arange(1, n + 1))
    k = sum(rows)
    order = list(np.argsort(-areas))
    seeds, rest = order[:k], order[k:]

    def box(i):
        o = objs[i]
        return [o[1].start, o[0].start, o[1].stop, o[0].stop]

    def gap(b1, b2):
        dx = max(0, max(b1[0], b2[0]) - min(b1[2], b2[2]))
        dy = max(0, max(b1[1], b2[1]) - min(b1[3], b2[3]))
        return dx * dx + dy * dy

    groups = {s: [s] for s in seeds}
    for r in rest:
        groups[min(seeds, key=lambda s: gap(box(s), box(r)))].append(r)
    items = []
    for s, ids in groups.items():
        sel = np.isin(lab, [i + 1 for i in ids]) & mask
        ys, xs = np.flatnonzero(sel.any(1)), np.flatnonzero(sel.any(0))
        items.append(dict(sel=sel, box=(xs[0], ys[0], xs[-1] + 1, ys[-1] + 1)))
    items.sort(key=lambda it: (it['box'][1] + it['box'][3]) / 2)
    ordered, i = [], 0
    for cnt in rows:
        row = sorted(items[i:i + cnt], key=lambda it: it['box'][0]); i += cnt
        ordered += row
    meta = {}
    for name, it in zip(names, ordered):
        l, t, r, b = it['box']
        piece = a[t:b, l:r].copy()
        piece[..., 3] = piece[..., 3] * it['sel'][t:b, l:r]
        pim = Image.fromarray(piece, 'RGBA')
        if max(pim.size) > 420:
            pim.thumbnail((420, 420), Image.Resampling.LANCZOS)
        pim.save(out(f'items/{name}.png'))
        meta[name] = pim.size
    return meta


def main():
    # No se borra assets/: ahí también viven el audio, la interfaz y el kit v2.
    backgrounds()
    sheets = {
        '01_Personajes/02_flight_sheet_1536x256.png': 'sprites/tern_flight.png',
        '01_Personajes/03_glide_dive_fishing_sheet_2048x256.png': 'sprites/tern_dive.png',
        '01_Personajes/04_states_sheet_1536x256.png': 'sprites/tern_states.png',
        '03_Amenazas/10_air_obstacles_sheet_1024x1024.png': 'sprites/air.png',
        '03_Amenazas/12_desert_threats_sheet_1024x1280.png': 'sprites/desert.png',
        '02_Items/07_fish_collectibles_sheet_384x384.png': 'sprites/fish.png',
        '07_UI/31_ui_icons_hud_512x384.png': 'sprites/icons.png',
    }
    for s, d in sheets.items():
        shutil.copy2(KIT / s, out(d))
    meta = {}
    meta.update(split('02_Items/09_conservation_tools.png', [3, 3],
                      ['tool_sign', 'tool_fence', 'tool_cone', 'tool_lamp', 'tool_detour', 'tool_hat']))
    meta.update(split('02_Items/08_marine_trash.png', [3, 2],
                      ['trash_bottle', 'trash_bag', 'trash_line', 'trash_rings', 'trash_cap']))
    meta.update(split('03_Amenazas/11_sea_level_obstacles.png', [2, 3],
                      ['sea_pelican', 'sea_pelican_dive', 'sea_lion', 'sea_boat', 'sea_net'], dilate=14))
    meta.update(split('01_Personajes/05_eggs_and_chicks.png', [2, 3],
                      ['nest_eggs', 'chick_sit', 'chick_beg', 'chick_eat', 'chick_sleep']))
    pair = Image.open(KIT / '01_Personajes/06_pair_protecting_nest.png')
    pair.thumbnail((520, 520), Image.Resampling.LANCZOS)
    pair.save(out('items/pair_nest.png')); meta['pair_nest'] = pair.size
    card = Image.open(KIT / '07_UI/33_educational_fact_card.png')
    card.thumbnail((440, 660), Image.Resampling.LANCZOS)
    card.save(out('items/fact_card.png')); meta['fact_card'] = card.size
    out('items.json').write_text(json.dumps({k: list(map(int, v)) for k, v in meta.items()}, indent=1))
    total = sum(p.stat().st_size for p in OUT.rglob('*') if p.is_file())
    print(f'assets: {sum(1 for p in OUT.rglob("*") if p.is_file())} archivos, {total / 1e6:.1f} MB')


if __name__ == '__main__':
    main()
