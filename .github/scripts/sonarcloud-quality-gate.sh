#!/usr/bin/env bash
# Reports the SonarCloud quality gate of the analysis that was just uploaded, without ever failing the job:
# a failed gate (or an unreadable result) becomes a warning annotation and a job summary,
# so pull requests can still be merged.
# Requires SONAR_TOKEN and the .scannerwork/report-task.txt written by the scanner.
set -uo pipefail

report=.scannerwork/report-task.txt
value() { grep "^$1=" "$report" | cut -d= -f2-; }
api() { curl -fsS --retry 3 -u "$SONAR_TOKEN:" "$1"; }
summary() { echo "$1" >> "${GITHUB_STEP_SUMMARY:-/dev/stdout}"; }
warn() {
  echo "::warning title=SonarCloud quality gate::$1"
  summary "### SonarCloud quality gate: not available"
  summary "$1"
  exit 0
}

[ -f "$report" ] || warn "No analysis report found ($report)."
dashboard=$(value dashboardUrl)
task_url=$(value ceTaskUrl)

status=PENDING
for _ in $(seq 1 60); do
  task=$(api "$task_url") || warn "Could not read the analysis task. See $dashboard"
  status=$(jq -r .task.status <<< "$task")
  case $status in SUCCESS | FAILED | CANCELED) break ;; esac
  sleep 5
done
[ "$status" = SUCCESS ] || warn "Analysis processing ended with status $status. See $dashboard"

analysis=$(jq -r .task.analysisId <<< "$task")
gate=$(api "https://sonarcloud.io/api/qualitygates/project_status?analysisId=$analysis") ||
  warn "Could not read the quality gate. See $dashboard"
gate_status=$(jq -r .projectStatus.status <<< "$gate")
failed=$(jq -r '.projectStatus.conditions[] | select(.status == "ERROR")
  | "\(.metricKey): \(.actualValue) (threshold \(.comparator) \(.errorThreshold))"' <<< "$gate")

summary "### SonarCloud quality gate: $gate_status"
summary "[Open the analysis]($dashboard)"
if [ "$gate_status" = OK ]; then
  echo "SonarCloud quality gate passed: $dashboard"
else
  while IFS= read -r condition; do summary "- $condition"; done <<< "$failed"
  echo "::warning title=SonarCloud quality gate $gate_status::$(paste -sd ';' - <<< "$failed") - $dashboard"
fi
exit 0
