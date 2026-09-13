#!/usr/bin/env bash
# Cross-platform submission gates; inspect only tracked files, never local secret files.
set -euo pipefail
node scripts/preflight.mjs
