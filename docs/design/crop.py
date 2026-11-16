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

# Parts of a card, for pictures that need its lower half (the flow diagram of
# the energy flow card): name, source crop, share of the height kept from.
PARTS = [('energy-flow-diagram', 'energy-flow', 0.44)]
for name, source, start in PARTS:
    card = Image.open(os.path.join(TARGET, f'{source}.png'))
    width, height = card.size
    part = card.crop((0, int(height * start), width, height))
    mask = Image.new('L', part.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, part.size[0] - 1, part.size[1] - 1), RADIUS, fill=255)
    part.putalpha(Image.composite(part.split()[3], mask, mask))
    part.save(os.path.join(TARGET, f'{name}.png'))
    print(f'{name}.png', part.size, file=sys.stderr)
