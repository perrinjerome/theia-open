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
  argument_parser.add_argument("filename")
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

  filename = options.filename
  if not os.path.isabs(options.filename):
    filename = os.path.join(os.getcwd(), options.filename)
  filename = os.path.normpath(filename)
  if not os.path.isfile(filename):
    argument_parser.error(f"File {options.filename} is not an existing file")

  if not options.token:
    argument_parser.error(
        "--token or THEIA_OPEN_EDITOR_TOKEN environment variable is required")
  if not options.url:
    argument_parser.error("--url or THEIA_URL environment variable is required")

  session = requests.Session()
  headers = {'X-Authentication-Token': os.environ['THEIA_OPEN_EDITOR_TOKEN']}

  ret = requests.post(
      url=urllib.parse.urljoin(options.url, "/api/openEditor/openFile"),
      json={'filePath': filename},
      headers=headers,
  )
  ret.raise_for_status()


  def close_editor() -> None:
    ret = requests.post(
        url=urllib.parse.urljoin(options.url, "/api/openEditor/closeFile"),
        json={'filePath': filename},
        headers=headers,
    )
    ret.raise_for_status()


  def is_file_open() -> bool:
    ret = requests.post(
        url=urllib.parse.urljoin(options.url, "/api/openEditor/isFileOpen"),
        json={'filePath': filename},
        headers=headers,
    )
    ret.raise_for_status()
    is_open = ret.json()
    assert isinstance(is_open, bool)
    return is_open


  def wait_for_editor_close(stdscr: _CursesWindow) -> int:

    stdscr.clear()
    stdscr.addstr(
        0, 0,
        f"Editing {filename}\nPress q to exit, or a to exit with error code.\n")
    stdscr.nodelay(True)
    stdscr.refresh()

    while True:
      k = stdscr.getch()
      if k == ord('q'):
        close_editor()
        return 0
      elif k == ord('a'):
        close_editor()
        return 1

      time.sleep(1)
      if not is_file_open():
        return 0


  if options.wait:
    try:
      sys.exit(curses.wrapper(wait_for_editor_close))
    except KeyboardInterrupt:
      close_editor()
      sys.exit(1)
