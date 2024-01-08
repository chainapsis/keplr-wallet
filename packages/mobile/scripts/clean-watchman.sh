#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

ROOT=${DIR//\/packages\/mobile\/scripts/}

watchman watch-del "${ROOT}" ; watchman watch-project "${ROOT}"
