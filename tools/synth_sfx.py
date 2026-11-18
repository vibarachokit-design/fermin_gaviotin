"""Efectos de sonido procedurales (gratuitos, sin servicios externos) para El Vuelo del Gaviotín.

Genera señales de UI, viento, burbujas, motores, herramientas y ambientes en loop.
Uso:  python tools/synth_sfx.py <carpeta_salida>      (requiere numpy, scipy y ffmpeg)
"""
import sys, subprocess, tempfile, os
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile

SR = 44100
rng = np.random.default_rng(7)


def t(d): return np.arange(int(d * SR)) / SR
def env(n, a=0.005, r=0.2):
    e = np.ones(n); na = max(1, int(a * SR)); e[:na] = np.linspace(0, 1, na)
    x = np.arange(n) / SR
    return e * np.exp(-x / r)
def bp(x, lo, hi, order=2): return sosfilt(butter(order, [lo, hi], 'bandpass', fs=SR, output='sos'), x)
def lp(x, f, order=2): return sosfilt(butter(order, f, 'lowpass', fs=SR, output='sos'), x)
def hp(x, f, order=2): return sosfilt(butter(order, f, 'highpass', fs=SR, output='sos'), x)
def noise(d): return rng.standard_normal(int(d * SR))
def brown(d):
    x = np.cumsum(noise(d)); x = hp(x, 20); return x / (np.abs(x).max() + 1e-9)
def place(buf, snd, at):
    i = int(at * SR); j = min(len(buf), i + len(snd)); buf[i:j] += snd[:j - i]; return buf
def bell(f, d, r=0.25, partials=((1, 1), (2.76, .35), (5.4, .15))):
    x = t(d); return sum(a * np.sin(2 * np.pi * f * k * x) * np.exp(-x / (r / k ** .5)) for k, a in partials)
def marimba(f, d=0.5): x = t(d); return (np.sin(2*np.pi*f*x) + .25*np.sin(2*np.pi*4*f*x)*np.exp(-x/.03)) * np.exp(-x/.18)
def sweep_bp(x, f0, f1, width=0.6, steps=40):
    """Filtro pasabanda cuyo centro se mueve de f0 a f1 (por bloques)."""
    out = np.zeros_like(x); n = len(x); blk = n // steps
    for s in range(steps):
        fc = f0 * (f1 / f0) ** (s / max(1, steps - 1))
        lo, hi = fc * (1 - width / 2), min(fc * (1 + width / 2), SR / 2 - 100)
        seg = bp(x[max(0, s*blk-2000):(s+1)*blk if s < steps-1 else n], lo, hi)
        out[s*blk:(s+1)*blk if s < steps-1 else n] = seg[-((s+1)*blk - s*blk if s < steps-1 else n - s*blk):]
    return out
def loopify(x, fade=1.5):
    """Hace un loop sin corte: mezcla el final sobre el inicio."""
    f = int(fade * SR); body = x[:-f].copy(); tail = x[-f:]
    w = np.linspace(0, 1, f); body[:f] = body[:f] * w + tail * (1 - w); return body


def star():
    b = np.zeros(int(.7 * SR))
    for i, f in enumerate([1047, 1319, 1568, 2093]): place(b, bell(f, .5, .18) * .5, i * .06)
    return b
def life_lost():
    b = np.zeros(int(1.0 * SR))
    for i, f in enumerate([523, 440, 349]): place(b, marimba(f, .5), i * .16)
    return b
def falcon_warning():
    b = np.zeros(int(.45 * SR)); x = t(.07)
    beep = np.sign(np.sin(2*np.pi*1400*x)) * .35 * env(len(x), .003, .05)
    place(b, lp(beep, 5000), 0); place(b, lp(beep, 5000), .14); return b
def wind_gust():
    d = 1.4; x = sweep_bp(noise(d), 250, 1100, .9) ; e = np.sin(np.pi * t(d) / d) ** 1.5
    x2 = sweep_bp(noise(d), 1100, 350, .9); return (x * .6 + x2 * .4) * e
def bubbles(d=1.0, n=9):
    b = np.zeros(int(d * SR))
    for _ in range(n):
        dur = rng.uniform(.03, .07); x = t(dur); f0 = rng.uniform(350, 900)
        ph = 2*np.pi*np.cumsum(f0 * (1 + 2*x/dur)) / SR
        place(b, np.sin(ph) * np.exp(-x/(dur/2.5)) * rng.uniform(.3, .7), rng.uniform(0, d - .1))
    return b
def threat_leaves():
    d = .7; w = sweep_bp(noise(d), 1400, 300, .8) * np.sin(np.pi * t(d) / d)
    x = t(d); tone = np.sin(2*np.pi*np.cumsum(500 + 500*x/d)/SR) * .15 * env(len(x), .02, .25)
    return w * .7 + tone
def night_fall():
    d = 2.6; x = t(d); a = np.minimum(1, x / 1.0) * np.minimum(1, (d - x) / 1.0)
    chord = sum(np.sin(2*np.pi*f*x) * g for f, g in [(220, .5), (261.6, .35), (329.6, .35), (493.9, .2)])
    sh = sum(np.sin(2*np.pi*f*x + rng.uniform(0, 6)) * .05 * (0.5 + 0.5*np.sin(2*np.pi*k*x)) for f, k in [(1760, 3), (2093, 4.3), (2637, 5.1)])
    return (chord + sh) * a
def floodlight_on():
    d = .9; x = t(d)
    clunk = np.sin(2*np.pi*70*x) * np.exp(-x/.06) + lp(noise(d), 2500) * np.exp(-x/.015) * .6
    hum = (np.sin(2*np.pi*100*x) + .5*np.sin(2*np.pi*200*x) + .25*np.sin(2*np.pi*300*x)) * np.minimum(1, x/.4) * .25
    return clunk + hum * np.minimum(1, (d - x) / .2)
def floodlight_hum():
    d = 2.0; x = t(d)
    s = np.sin(2*np.pi*100*x) + .5*np.sin(2*np.pi*200*x) + .3*np.sin(2*np.pi*300*x) + .1*np.sin(2*np.pi*1200*x)
    return s * (1 + .05*np.sin(2*np.pi*2*x)) + lp(noise(d), 3000) * .03
def knock(f=320):
    d = .25; x = t(d)
    return np.sin(2*np.pi*f*x) * np.exp(-x/.04) + bp(noise(d), 800, 3000) * np.exp(-x/.01) * .7
def tool_sign():
    b = np.zeros(int(.6 * SR)); place(b, knock(300), 0); place(b, knock(280), .17); return b
def tool_fence():
    d = .7; x = t(.35)
    f = 200 + 50*np.sin(2*np.pi*7*x) + rng.normal(0, 8, len(x))
    creak = np.sign(np.sin(2*np.pi*np.cumsum(f)/SR)) * .2 * np.sin(np.pi*x/.35)
    b = np.zeros(int(d * SR)); place(b, bp(creak, 300, 2500), 0); place(b, knock(140) * 1.2, .38); return b
def tool_detour():
    d = .8; x = t(d)
    s = sum(a*np.sin(2*np.pi*f*x)*np.exp(-x/r) for f, a, r in [(520, 1, .35), (1380, .6, .25), (2210, .4, .18), (3300, .25, .1)])
    return s + bp(noise(d), 2000, 8000) * np.exp(-x/.01) * .5
def tool_lamp():
    b = np.zeros(int(.8 * SR)); x = t(.02); place(b, bp(noise(.02), 2000, 6000) * np.exp(-x/.004), 0)
    place(b, bell(1568, .6, .25) * .4, .05); place(b, bell(2093, .6, .25) * .3, .12); return b
def engine(f0, d=2.0, buzz=.3):
    x = t(d + 1.5); ph = 2*np.pi*f0*x
    pulses = np.maximum(0, np.sin(ph)) ** 6
    s = lp(pulses, 900) + buzz * lp(np.sign(np.sin(ph * 2)), 1500) * .3 + lp(noise(d + 1.5), 400) * .4
    gravel = bp(noise(d + 1.5), 2500, 7000) * .08 * (0.6 + 0.4*np.sin(2*np.pi*3*x))
    return loopify(s + gravel)
def footsteps():
    d = 2.0; b = np.zeros(int((d + 1.5) * SR))
    for i in range(6):
        st = i * .5 + rng.uniform(-.02, .02); x = t(.14)
        crunch = bp(noise(.14), 600, 5000) * np.exp(-x/.04)
        grains = (rng.random(len(x)) > .985) * rng.uniform(-1, 1, len(x)) * np.exp(-x/.06)
        place(b, crunch * .6 + hp(grains, 2000) * .8, st)
    return loopify(b)
def amb_wind(d=24, lo=150, hi=900, swell=8.0, gain=1.0):
    x = t(d + 2); w = bp(brown(d + 2) + noise(d + 2) * .05, lo, hi)
    e = .6 + .4 * np.sin(2*np.pi*x/swell) * np.sin(2*np.pi*x/(swell*1.7))
    return loopify(w * e * gain, 2.0)
def amb_bay(d=24):
    x = t(d + 2); waves = lp(noise(d + 2), 900) * (.3 + .7 * np.clip(np.sin(2*np.pi*x/6.5), 0, 1) ** 2)
    return loopify(waves + bp(brown(d + 2), 200, 1200) * .3, 2.0)
def amb_underwater(d=24):
    x = t(d + 2); r = lp(brown(d + 2), 250) * 2 * (.8 + .2*np.sin(2*np.pi*x/7))
    b = np.zeros(len(x))
    for k in range(int(d / 2)): place(b, bubbles(1.0, 4) * .5, rng.uniform(0, d))
    return loopify(r + b, 2.0)
def amb_desert_night(d=24):
    x = t(d + 2); w = amb_wind(d, 120, 600, 11, .5)
    hum = np.sin(2*np.pi*60*t(d)) * .015
    return w[:len(hum)] + hum


SOUNDS = {
    'sfx_star': star, 'sfx_life_lost': life_lost, 'sfx_falcon_warning': falcon_warning, 'sfx_wind_gust': wind_gust,
    'sfx_bubbles': bubbles, 'sfx_threat_leaves': threat_leaves, 'sfx_night_fall': night_fall,
    'sfx_floodlight_on': floodlight_on, 'sfx_floodlight_hum': floodlight_hum, 'sfx_tool_sign': tool_sign,
    'sfx_tool_fence': tool_fence, 'sfx_tool_detour': tool_detour, 'sfx_tool_lamp': tool_lamp,
    'sfx_truck_loop': lambda: engine(38, buzz=.2), 'sfx_atv_loop': lambda: engine(72, buzz=.5),
    'sfx_footsteps_loop': footsteps,
    'amb_ocean_wind': lambda: amb_wind(24, 180, 1000, 7, 1.0), 'amb_bay': amb_bay, 'amb_underwater': amb_underwater,
    'amb_desert_day': lambda: amb_wind(24, 300, 1600, 10, .8), 'amb_desert_night': amb_desert_night,
}


def main(out):
    os.makedirs(out, exist_ok=True)
    for name, fn in SOUNDS.items():
        x = np.asarray(fn(), dtype=np.float64)
        x = x / (np.abs(x).max() + 1e-9) * (0.5 if name.startswith('amb_') else 0.85)
        if not name.endswith('_loop') and not name.startswith('amb_') and name != 'sfx_floodlight_hum':
            f = int(.01 * SR); x[-f:] *= np.linspace(1, 0, f)
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as tmp:
            wavfile.write(tmp.name, SR, (x * 32767).astype(np.int16))
        subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', tmp.name,
                        '-ac', '1', '-b:a', '80k', os.path.join(out, name + '.mp3')], check=True)
        os.unlink(tmp.name)
        print(f'{name}: {len(x) / SR:.2f}s')


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'assets/audio')
