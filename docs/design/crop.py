"""Cuts the page margin off the card screenshots and rounds their corners,
so the banner and the showcase can lay them over any background."""
import glob
import os
import sys

from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
SOURCE = os.path.join(HERE, '..', 'assets', 'cards')
TARGET = os.path.join(HERE, 'crops')
PAD = 28  # the 14 px margin of the captures, at 2x
RADIUS = 32

os.makedirs(TARGET, exist_ok=True)
for path in sorted(glob.glob(os.path.join(SOURCE, '*.png'))):
    image = Image.open(path).convert('RGBA')
    width, height = image.size
    card = image.crop((PAD, PAD, width - PAD, height - PAD))
    mask = Image.new('L', card.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, card.size[0] - 1, card.size[1] - 1), RADIUS, fill=255)
    card.putalpha(mask)
    card.save(os.path.join(TARGET, os.path.basename(path)))
    print(os.path.basename(path), card.size, file=sys.stderr)
