#!/usr/bin/env python3
"""Original audio assets for Distribuidora 3 Irmãos.

All musical material and synthesis are original. No recordings, samples,
existing melodies, or third-party sound libraries are used.
Dependencies: Python 3, numpy, scipy; ffmpeg for MP3 export.
"""
from pathlib import Path
import json
import math
import subprocess

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt


import argparse
parser = argparse.ArgumentParser(description='Generate the original 3 Irmãos music and effects into a chosen output folder.')
parser.add_argument('output', type=Path)
OUT = parser.parse_args().output.resolve()
OUT.mkdir(parents=True, exist_ok=True)
SR = 44100
RNG = np.random.default_rng(3182026)
BPM = 100
BEAT = 60 / BPM
BARS = 12
LENGTH = BARS * 4 * BEAT
N = round(LENGTH * SR)
BUS = np.zeros((N, 2), np.float64)


def hz(midi):
    return 440 * 2 ** ((midi - 69) / 12)


def times(duration):
    return np.arange(round(duration * SR)) / SR


def lowpass(x, cutoff):
    return sosfilt(butter(2, cutoff, fs=SR, output="sos"), x)


def bandpass(x, low, high):
    return sosfilt(butter(2, [low, high], btype="bandpass", fs=SR, output="sos"), x)


def fade(x, attack=.003, release=.025):
    x = np.array(x, copy=True)
    a, r = min(len(x), round(attack * SR)), min(len(x), round(release * SR))
    if a:
        x[:a] *= np.sin(np.linspace(0, np.pi / 2, a)) ** 2
    if r:
        x[-r:] *= np.cos(np.linspace(0, np.pi / 2, r)) ** 2
    return x


def marimba(midi, duration=.85, velocity=1):
    t = times(duration)
    f = hz(midi)
    # A short warm fundamental, barely inharmonic wooden overtones, soft mallet.
    x = np.sin(2 * np.pi * f * t) * np.exp(-t / .24)
    x += .25 * np.sin(2 * np.pi * f * 2.008 * t) * np.exp(-t / .09)
    x += .065 * np.sin(2 * np.pi * f * 3.98 * t) * np.exp(-t / .04)
    x += .02 * bandpass(RNG.standard_normal(len(t)), 900, 2600) * np.exp(-t / .009)
    return velocity * fade(x, .006, .055)


def mellow_pluck(midi, duration=1.45):
    t = times(duration)
    f = hz(midi)
    x = (np.sin(2 * np.pi * f * t) + .19 * np.sin(2 * np.pi * f * 2 * t)
         + .05 * np.sin(2 * np.pi * f * 3 * t)) * np.exp(-t / .42)
    return fade(x, .012, .09)


def bass(midi, duration=.46):
    t = times(duration)
    f = hz(midi)
    x = (np.sin(2 * np.pi * f * t) + .19 * np.sin(2 * np.pi * 2 * f * t))
    x *= np.exp(-t / .27)
    return fade(x, .013, .09)


def pad(midi, duration=3.05):
    t = times(duration)
    f = hz(midi)
    x = .68 * np.sin(2 * np.pi * f * t)
    x += .17 * np.sin(2 * np.pi * f * 1.0015 * t + .3)
    x += .10 * np.sin(2 * np.pi * f * 2 * t)
    envelope = (1 - np.exp(-t / .18)) * np.exp(-t / 1.4)
    return fade(x * envelope, .06, .8)


def kick():
    t = times(.23)
    phase = 2 * np.pi * (52 * t + 42 * .014 * (1 - np.exp(-t / .014)))
    return fade(np.sin(phase) * np.exp(-t / .065), .006, .05)


def shaker():
    t = times(.072)
    x = bandpass(RNG.standard_normal(len(t)), 3000, 6900)
    return fade(x * np.exp(-t / .018), .004, .03)


def rim():
    t = times(.10)
    x = .7 * np.sin(2 * np.pi * 510 * t) * np.exp(-t / .009)
    x += .4 * bandpass(RNG.standard_normal(len(t)), 750, 2100) * np.exp(-t / .017)
    return fade(x, .001, .03)


def add(sound, beat, gain=1, pan=0):
    """Wrap all note and reverb tails into the loop, preserving seamless playback."""
    start = round(beat * BEAT * SR)
    idx = (start + np.arange(len(sound))) % N
    angle = (pan + 1) * np.pi / 4
    BUS[idx, 0] += sound * gain * np.cos(angle)
    BUS[idx, 1] += sound * gain * np.sin(angle)


# 12-bar original composition. Small non-repeating phrases, generous space,
# soft syncopation and a final suspended phrase invite another pass through C.
chords = [
    [60, 64, 67, 69], [57, 60, 64, 67], [53, 57, 60, 64], [55, 57, 62, 67],
    [60, 64, 67, 69], [52, 55, 59, 62], [53, 57, 60, 62], [55, 57, 62, 67],
    [57, 60, 64, 67], [53, 57, 60, 64], [50, 57, 60, 65], [55, 59, 62, 64],
]
roots = [36, 33, 29, 31, 36, 28, 29, 31, 33, 29, 26, 31]
melody = [
    [(0.5, 76), (1.25, 79), (2.5, 74), (3.25, 72)],
    [(0.75, 76), (2.0, 81), (2.75, 79)],
    [(0.0, 77), (1.5, 76), (2.25, 72), (3.5, 69)],
    [(0.5, 74), (1.25, 79), (2.75, 76)],
    [(0.25, 79), (1.0, 76), (2.5, 74), (3.25, 76)],
    [(0.5, 71), (1.75, 74), (3.0, 79)],
    [(0.75, 77), (1.5, 81), (2.75, 76), (3.5, 72)],
    [(0.25, 74), (1.5, 79), (3.0, 74)],
    [(0.5, 76), (1.25, 81), (2.0, 79), (3.25, 72)],
    [(0.25, 77), (1.75, 76), (2.5, 72)],
    [(0.5, 74), (1.25, 77), (2.75, 76), (3.5, 74)],
    [(0.5, 71), (1.5, 74), (2.75, 79)],
]

for bar, chord in enumerate(chords):
    b = bar * 4
    for ni, note in enumerate(chord):
        add(pad(note), b + ni * .018, .036, (ni - 1.5) * .33)
    # A quiet, staggered accompaniment answered by the foreground marimba.
    for beat, top in [(0.0, False), (1.75, True), (3.0, False)]:
        notes = chord[1:] if top else chord[:3]
        for ni, note in enumerate(notes):
            add(mellow_pluck(note), b + beat + ni * .032,
                .032 if top else .026, -.42 + ni * .22)
    for k, (beat, note) in enumerate(melody[bar]):
        add(marimba(note), b + beat + .008 * math.sin(bar + k),
            .123 * (1 - .055 * (k % 3)), .22 * math.sin(bar * .9 + k))
    add(bass(roots[bar], .57), b, .13, 0)
    add(bass(roots[bar] + 7, .40), b + 2.5, .086, .02)
    for beat in [0, 2]:
        add(kick(), b + beat, .058, 0)
    for beat in [1, 3]:
        add(rim(), b + beat + .007, .028, -.12)
    for eighth in range(8):
        add(shaker(), b + eighth * .5 + (.025 if eighth % 2 else 0),
            .012 if eighth % 2 else .018, .38 if eighth % 2 else -.38)

# Short circular room reflections. Circular shifts preserve end-to-start tails.
dry = BUS.copy()
for delay, gain, swap in [(.073, .065, True), (.127, .05, False),
                           (.231, .043, True), (.349, .027, False),
                           (.493, .018, True)]:
    reflection = np.roll(dry, round(delay * SR), axis=0)
    if swap:
        reflection = reflection[:, ::-1]
    BUS += reflection * gain
BUS -= BUS.mean(axis=0)
# Keep the warm instrumentation's transients with ample unclipped headroom.
BUS *= .64 / np.max(np.abs(BUS))


def sfx_combine(events, duration):
    out = np.zeros(round(duration * SR))
    for at, sound, gain in events:
        start = round(at * SR)
        count = min(len(sound), len(out) - start)
        out[start:start + count] += sound[:count] * gain
    return fade(out, .003, .035)


def bell(midi, duration=.45):
    t = times(duration)
    f = hz(midi)
    x = np.sin(2 * np.pi * f * t) * np.exp(-t / .13)
    x += .13 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t / .055)
    return fade(x, .006, .08)


def glide(f0, f1, duration, decay=.12):
    t = times(duration)
    phase = 2 * np.pi * (f0 * t + (f1 - f0) * t ** 2 / (2 * duration))
    return fade(np.sin(phase) * np.exp(-t / decay), .008, .06)


sfx = {}
t = times(.085)
sfx['step'] = fade(lowpass(RNG.standard_normal(len(t)), 900) * np.exp(-t / .014)
                   + .28 * np.sin(2 * np.pi * 170 * t) * np.exp(-t / .018), .004, .025)
sfx['jump'] = glide(330, 700, .23, .105)
t = times(.17)
sfx['land'] = fade(np.sin(2 * np.pi * (102 * t - 85 * t ** 2)) * np.exp(-t / .029)
                   + .1 * lowpass(RNG.standard_normal(len(t)), 700) * np.exp(-t / .025), .004, .06)
sfx['collect'] = sfx_combine([(0, bell(79), .9), (.09, bell(84), .7)], .48)
sfx['door'] = sfx_combine([(0, mellow_pluck(60, .42), .8),
                            (.13, mellow_pluck(67, .48), .6)], .61)
t = times(.22)
paper = bandpass(RNG.standard_normal(len(t)), 700, 2700)
sfx['page'] = fade(paper * np.sin(np.pi * np.minimum(t / .22, 1)) ** 2, .018, .05)
sfx['mission'] = sfx_combine([(0, marimba(72, .55), .7),
                              (.13, marimba(76, .56), .6),
                              (.26, bell(79, .55), .6)], .81)
sfx['complete'] = sfx_combine([(0, marimba(72, .7), .65),
                               (.15, marimba(76, .7), .55),
                               (.30, marimba(79, .7), .6),
                               (.49, bell(84, .75), .65),
                               (.49, mellow_pluck(60, .8), .3),
                               (.49, mellow_pluck(64, .8), .22)], 1.30)
sfx['hint'] = sfx_combine([(0, bell(76, .42), .7), (.15, bell(79, .45), .5)], .60)
sfx['respawn'] = sfx_combine([(0, mellow_pluck(67, .42), .5),
                              (.12, mellow_pluck(72, .47), .6),
                              (.26, marimba(76, .48), .55)], .75)
sfx['click'] = marimba(79, .08)

peaks = {'step': .075, 'jump': .22, 'land': .16, 'collect': .32,
         'door': .24, 'page': .13, 'mission': .29, 'complete': .33,
         'hint': .21, 'respawn': .23, 'click': .16}


def write_wav(name, samples):
    samples = np.asarray(samples)
    if np.max(np.abs(samples)) >= 1:
        raise RuntimeError(f'Clipping in {name}')
    wavfile.write(OUT / name, SR, np.round(samples * 32767).astype(np.int16))


write_wav('music-master.wav', BUS)
for name, sound in sfx.items():
    sound -= np.mean(sound)
    sound = fade(sound, .003, .012)
    sound *= peaks[name] / np.max(np.abs(sound))
    write_wav(name + '.wav', sound)

subprocess.run(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error',
                '-i', str(OUT / 'music-master.wav'), '-c:a', 'libmp3lame',
                '-b:a', '160k', '-ar', str(SR), '-id3v2_version', '3',
                '-metadata', 'title=Pequenas Descobertas',
                '-metadata', 'comment=Original synthesized composition; no third-party samples',
                str(OUT / 'music.mp3')], check=True)

manifest = {'title': 'Pequenas Descobertas', 'bpm': BPM, 'bars': BARS,
            'loop_seconds': LENGTH, 'sample_rate_hz': SR,
            'provenance': 'Original synthesized composition and sound effects. No third-party recordings, samples, existing melodies, or audio logos were used.',
            'license': 'Created for this project; no third-party licensing restrictions. May be used, modified, and distributed with the project.',
            'suggested_gains': {'music': .32, 'step': .18, 'jump': .35, 'land': .28,
                                'collect': .50, 'door': .38, 'page': .30,
                                'mission': .50, 'complete': .55, 'hint': .35,
                                'respawn': .40, 'click': .30},
            'files': {}}
for path in sorted(OUT.glob('*.wav')):
    rate, data = wavfile.read(path)
    x = data.astype(np.float64) / 32768
    p = float(np.max(np.abs(x)))
    manifest['files'][path.name] = {
        'path': str(path), 'duration_seconds': len(data) / rate,
        'channels': 1 if data.ndim == 1 else data.shape[1],
        'peak_dbfs': round(20 * math.log10(p), 3),
        'rms_dbfs': round(20 * math.log10(np.sqrt(np.mean(x*x))), 3),
        'clipped_samples': int(np.count_nonzero(np.abs(x) >= .99997)),
        'size_bytes': path.stat().st_size,
    }
manifest['loop_seam'] = {
    'boundary_sample_step': float(np.max(np.abs(BUS[0] - BUS[-1]))),
    'largest_interior_sample_step': float(np.max(np.abs(np.diff(BUS, axis=0)))),
    'technique': 'All note tails and room reflections wrap circularly; no endpoint fade or silence. MP3 has encoder gapless trim metadata. Use Web Audio decoded buffer loop=true.',
}
manifest['files']['music.mp3'] = {
    'path': str(OUT / 'music.mp3'), 'duration_seconds': LENGTH,
    'channels': 2, 'bitrate_kbps': 160,
    'size_bytes': (OUT / 'music.mp3').stat().st_size,
}
decoded = subprocess.check_output(['ffmpeg', '-v', 'error', '-i',
                                   str(OUT / 'music.mp3'), '-f', 'f32le',
                                   '-acodec', 'pcm_f32le', '-'])
x = np.frombuffer(decoded, dtype='<f4').reshape(-1, 2)
manifest['mp3_decode_verification'] = {
    'decoded_frames': len(x), 'decoded_duration_seconds': len(x) / SR,
    'peak_dbfs': float(20 * np.log10(np.max(np.abs(x)))),
    'clipped_samples': int(np.count_nonzero(np.abs(x) >= 1)),
    'boundary_sample_step': float(np.max(np.abs(x[0] - x[-1]))),
    'largest_interior_sample_step': float(np.max(np.abs(np.diff(x, axis=0)))),
}
(OUT / 'audio-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
print(json.dumps(manifest, indent=2))
