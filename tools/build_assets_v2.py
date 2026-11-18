"""Procesa el kit de arte v2 (capítulos 2–8) desde sus JPG originales y deja los assets listos para el juego.

Reutiliza el recorte por figura y el quitado de fondo magenta sin halo de Gaviotin_Arte_Kit/SOURCE/reprocess_kit.py.
Uso:  python tools/build_assets_v2.py   (desde la carpeta juego)
"""
from pathlib import Path
import importlib.util, shutil, tempfile
import numpy as np
from PIL import Image

GAME = Path(__file__).resolve().parent.parent
ROOT = GAME.parent
KIT2 = ROOT / 'Gaviotin_Arte_Kit_v2'
RAW = KIT2 / 'RAW_JPG'
OUT = GAME / 'assets'

spec = importlib.util.spec_from_file_location('rk', ROOT / 'Gaviotin_Arte_Kit' / 'SOURCE' / 'reprocess_kit.py')
rk = importlib.util.module_from_spec(spec); spec.loader.exec_module(rk)
rk.RAW = RAW
TMP = Path(tempfile.mkdtemp(prefix='kitv2_'))
rk.PNG = TMP


def out(rel):
    p = OUT / rel; p.parent.mkdir(parents=True, exist_ok=True); return p


def webp(im, rel, q=84):
    im.save(out(rel), 'WEBP', quality=q, method=6)


def keyed(stem, **k):
    return rk.alpha_crop(rk.to_image(rk.chroma_key(stem, **k)), pad=4)


def sprites():
    specs = [  # stem, filas, columnas, nombre en el juego, alineación
        ('02_courtship_offer_fish_8_frames', 1, 8, 'offer_fish', 'ground'),
        ('03_courtship_pair_flight_6_frames', 1, 6, 'pair_flight', 'register'),   # dos aves por cuadro: se corta por columnas
        ('04_incubating_adult_8_frames', 1, 8, 'incubating', 'ground'),
        ('05_chick_newly_hatched_6_frames', 1, 6, 'chick1', 'ground'),
        ('06_chick_two_weeks_6_frames', 1, 6, 'chick2', 'ground'),
        ('07_chick_fledgling_6_frames', 1, 6, 'chick3', 'ground'),
        ('08_juvenile_learning_fly_8_frames', 1, 8, 'juvenile', 'ground'),
        ('10_nest_predators_4x4', 4, 4, 'predators', ['ground', 'ground', 'ground', 'center']),
    ]
    for stem, rows, cols, name, align in specs:
        strip = (0,) if name == 'pair_flight' else ()
        try:
            rk.sprite_sheet(stem, rows, cols, 256, f'{name}.png', f'_{name}', align, strip_rows=strip)
        except RuntimeError as e:   # figuras que se tocan: se corta por columnas
            print(f'  {stem}: {e} -> corte por columnas')
            rk.sprite_sheet(stem, rows, cols, 256, f'{name}.png', f'_{name}', align, strip_rows=tuple(range(rows)))
        shutil.copy2(TMP / f'{name}.png', out(f'sprites/{name}.png'))
    for stem, cols, rows, name in [('11_heat_shadow_icons', 2, 2, 'heat_icons'), ('36_ui_new_icons_4x3', 4, 3, 'icons2')]:
        rk.grid_sheet(stem, cols, rows, 128, f'{name}.png', f'_{name}')
        shutil.copy2(TMP / f'{name}.png', out(f'sprites/{name}.png'))
    fam = keyed('09_family_departure_cutout'); fam.thumbnail((900, 600), Image.Resampling.LANCZOS)
    fam.save(out('items/family_departure.png'))


def layers():
    # Cielos opacos: se agrandan a 1920 de ancho y se toma una franja de 720 que mantiene el sol a la vista.
    for stem, name, ry in [('12_ch1_arrival_sky', 'v2_arrival_sky', 160), ('16_ch3_courtship_sky', 'v2_courtship_sky', 380),
                           ('22_ch8_departure_sky', 'v2_departure_sky', 420)]:
        im = Image.open(RAW / f'{stem}.jpg').convert('RGB').resize((1920, 1280), Image.Resampling.LANCZOS)
        webp(im.crop((0, ry, 1920, ry + 720)), f'bg/{name}.webp')
    # Franjas de Mejillones y del mar: fondo quitado, recortadas a su contenido, misma escala que los cielos.
    for stem, name in [('13_ch1_arrival_far', 'v2_arrival_far'), ('14_ch1_arrival_near_water', 'v2_arrival_water'),
                       ('17_ch3_courtship_far', 'v2_courtship_far'), ('18_ch3_courtship_water', 'v2_courtship_water'),
                       ('23_ch8_departure_far', 'v2_departure_far'), ('24_ch8_departure_water', 'v2_departure_water')]:
        im = rk.to_image(rk.chroma_key(stem))
        a = np.asarray(im)[..., 3] > 128
        rows = np.flatnonzero(a.mean(1) > 0.02); cols = np.flatnonzero(a.mean(0) > 0.02)
        im = im.crop((cols[0], max(0, rows[0] - 4), cols[-1] + 1, min(im.height, rows[-1] + 5)))
        im = im.resize((1920, round(im.height * 1920 / im.width)), Image.Resampling.LANCZOS)
        # Quita el tinte rosado que deja el fondo magenta en la camanchaca (solo la llegada: los
        # atardeceres del cortejo y la partida tienen tonos violeta legítimos).
        if 'arrival' not in name:
            webp(im, f'bg/{name}.webp', 86); print(f'  {name}: {im.size}'); continue
        arr = np.asarray(im).astype(np.int16)
        m = np.clip(np.minimum(arr[..., 0], arr[..., 2]) - arr[..., 1] - 6, 0, 255)
        arr[..., 0] -= m; arr[..., 2] -= m
        im = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8), 'RGBA')
        webp(im, f'bg/{name}.webp', 86)
        print(f'  {name}: {im.size}')


def scenes():
    def cover(stem, rel, ratio=16 / 9, bias=0.5, q=82):
        im = Image.open(RAW / f'{stem}.jpg').convert('RGB')
        w, h = im.size; nh = int(w / ratio); y0 = int((h - nh) * bias)
        webp(im.crop((0, y0, w, y0 + nh)).resize((1280, 720), Image.Resampling.LANCZOS), rel, q)
    cover('15_ch2_pampa_map', 'scenes/pampa_map.webp', bias=0.5)
    for stem, name in [('19_nest_close_midday', 'nest_midday'), ('20_nest_close_afternoon', 'nest_afternoon'), ('21_nest_close_night', 'nest_night')]:
        cover(stem, f'scenes/{name}.webp', bias=0.6)
    for i, stem in enumerate(['25_chapter_1_arrival', '26_chapter_2_settle', '27_chapter_3_courtship', '28_chapter_4_nest_eggs',
                              '29_chapter_5_incubation', '30_chapter_6_feed_chick', '31_chapter_7_grow_fly', '32_chapter_8_departure'], 1):
        cover(stem, f'chapters/ch{i}.webp', bias=0.5, q=80)
    cover('35_ui_season_summary', 'scenes/season_summary.webp')
    alb = keyed('34_ui_season_album'); alb.thumbnail((1180, 680), Image.Resampling.LANCZOS); alb.save(out('ui/album.png'))
    cal = keyed('33_ui_season_calendar'); cal.thumbnail((1100, 220), Image.Resampling.LANCZOS); cal.save(out('ui/calendar.png'))


def cards():
    for p in sorted(RAW.glob('[3-5][0-9]_fact_*.jpg')):
        im = Image.open(p).convert('RGB').resize((420, 420), Image.Resampling.LANCZOS)
        webp(im, f'cards/{p.stem.split("_fact_")[1]}.webp', 82)


def main():
    print('Sprites'); sprites()
    print('Capas'); layers()
    print('Escenas'); scenes()
    print('Tarjetas'); cards()
    shutil.rmtree(TMP, ignore_errors=True)
    print('listo')


if __name__ == '__main__':
    main()
