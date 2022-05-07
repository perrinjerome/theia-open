import argparse
import curses
import os
import sys
import time
import urllib.parse

import requests

import typing
if typing.TYPE_CHECKING:
  from _curses import _CursesWindow
else:
  _CursesWindow = typing.Any


def main() -> None:

  argument_parser = argparse.ArgumentParser('theia-open')
  argument_parser.add_argument("filenames", nargs='+')
  argument_parser.add_argument("--wait", action="store_true")
  argument_parser.add_argument(
      "--url",
      default=os.environ.get('THEIA_URL'),
  )
  argument_parser.add_argument(
      "--token",
      default=os.environ.get('THEIA_OPEN_EDITOR_TOKEN'),
  )

  options = argument_parser.parse_args()

  filenames = []
  for filename in options.filenames:
    if not os.path.isabs(filename):
      filename = os.path.join(os.getcwd(), filename)
    filename = os.path.normpath(filename)
    #if not os.path.isfile(filename): # XXX keep original name
    #  argument_parser.error(f"File {filename} is not an existing file")
    filenames.append(filename)

  if not options.token:
    argument_parser.error(
        "--token or THEIA_OPEN_EDITOR_TOKEN environment variable is required")
  if not options.url:
    argument_parser.error(
        "--url or THEIA_URL environment variable is required")

  session = requests.Session()
  headers = {'X-Authentication-Token': os.environ['THEIA_OPEN_EDITOR_TOKEN']}

  for filename in filenames:
    ret = requests.post(
        url=urllib.parse.urljoin(options.url, "/api/openEditor/openFile"),
        json={'uri': f'file://{filename}'},
        headers=headers,
    )
    ret.raise_for_status()

  def close_editor(filename) -> None:
    ret = requests.post(
        url=urllib.parse.urljoin(options.url, "/api/openEditor/closeFile"),
        json={'uri': f'file://{filename}'},
        headers=headers,
    )
    ret.raise_for_status()
    delay = 0
    while True:
      delay = min(delay + 0.1, 1)
      time.sleep(delay)
      if not is_file_open(filename):
        return

  def is_file_open(filename) -> bool:
    ret = requests.post(
        url=urllib.parse.urljoin(options.url, "/api/openEditor/isFileOpen"),
        json={'uri': f'file://{filename}'},
        headers=headers,
    )
    ret.raise_for_status()
    is_open = ret.json()
    assert isinstance(is_open, bool)
    return is_open

  def wait_for_editor_close(stdscr: _CursesWindow, filename:str) -> int:
    curses.start_color()
    curses.use_default_colors()
    stdscr.clear()
    stdscr.addstr(0, 0, f"Editing {filename}")
    stdscr.addstr(1, 0, "Press ")
    stdscr.addstr("q", curses.A_BOLD)
    stdscr.addstr(" to exit, or ")
    stdscr.addstr("a", curses.A_BOLD)
    stdscr.addstr(" to exit with error code.\n")
    stdscr.nodelay(True)
    stdscr.refresh()

    delay = 0
    while True:
      k = stdscr.getch()
      if k == ord('q'):
        close_editor(filename)
        return 0
      elif k == ord('a'):
        close_editor(filename)
        return 1
      delay = min(delay + 0.1, 1)
      time.sleep(delay)
      if not is_file_open(filename):
        return 0

  if options.wait:
    assert len(filenames) == 1 # TODO
    try:
      sys.exit(curses.wrapper(wait_for_editor_close, filenames[0]))
    except KeyboardInterrupt:
      close_editor()
      sys.exit(1)
