#!/usr/bin/env python3
import os
import sys
import argparse
import subprocess

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXTENSION_ROOT = os.path.join(PROJECT_ROOT, 'packages', 'extension')
RELEASES_ROOT = os.path.join(PROJECT_ROOT, 'releases')


HEADING = r"""
__________                __
\______   \_____    ____ |  | _______     ____   ___________
 |     ___/\__  \ _/ ___\|  |/ /\__  \   / ___\_/ __ \_  __ \
 |    |     / __ \\  \___|    <  / __ \_/ /_/  >  ___/|  | \/
 |____|    (____  /\___  >__|_ \(____  /\___  / \___  >__|
                \/     \/     \/     \//_____/      \/

"""


def _current_version() -> str:
    cmd = ['git', 'describe', '--tags', '--always', '--dirty=-dirty']
    return subprocess.check_output(cmd).decode().strip()


def parse_commandline():
    parser = argparse.ArgumentParser()
    parser.add_argument('-d', '--allow-dirty', action='store_false', dest='check_for_dirty', help='Allow creation of a dirty release')
    parser.add_argument('-f', '--force', action='store_false', dest='check_for_existing', help='Overwrite existing releases if present')
    return parser.parse_args()


def main():
    args = parse_commandline()

    # collect information
    version = _current_version()
    output_filename = os.path.join(RELEASES_ROOT, f'wallet-{version[1:]}.zip')

    # user feedback
    print(HEADING)
    print(f'Version.......: {version}')
    print(f'Release output: {os.path.relpath(output_filename, PROJECT_ROOT)}')
    print()

    # check for dirty version (uncommitted changes)
    if args.check_for_dirty and version.endswith('-dirty'):
        print('ERROR: The current version is dirty')
        sys.exit(1)

    # check for the release has already been created
    if args.check_for_existing and os.path.exists(output_filename):
        print('ERROR: The release already exists')
        sys.exit(1)

    # package up up the built extension
    cmd = ['zip', '-r', output_filename, 'prod/']
    subprocess.check_call(cmd, cwd=EXTENSION_ROOT)


if __name__ == '__main__':
    main()
