#!/usr/bin/env bash
# Final verify: run api test suite and list build completion markers.

echo "== Running apps/api tests =="
if (cd apps/api && python -m pytest tests/); then
  echo "TESTS: PASS"
  rc=0
else
  echo "TESTS: FAIL"
  rc=1
fi

echo ""
echo "== Build status markers (.build/status/A*.done) =="
ls .build/status/A*.done 2>/dev/null || echo "(none found)"

exit $rc
