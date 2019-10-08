"""
  Weekly Challenges, 2019 Week 41
  https://www.codewars.com/kata/introtoart/
"""

def get_w(height):
  return list(generate_w(height)) if height > 1 else []

def generate_w(height):
  frst_dot = 0
  secd_dot = 2 * height - 2
  thrd_dot = 2 * height - 2
  four_dot = 4 * height - 4

  for _ in range(height):
    line = [' ' for i in range(4 * height - 3)]
    line[frst_dot] = '*'
    line[secd_dot] = '*'
    line[thrd_dot] = '*'
    line[four_dot] = '*'

    frst_dot += 1
    secd_dot -= 1
    thrd_dot += 1
    four_dot -= 1

    yield ''.join(line)


print(get_w(2))
