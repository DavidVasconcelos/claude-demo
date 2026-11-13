#!/bin/bash
# protect-files.sh

INPUT=$(cat)
echo "$INPUT" >> /tmp/protect-files-debug.log

# Write/Edit carry a file_path; Bash carries a command string. Check both.
TARGET=$(echo "$INPUT" | jq -r '(.tool_input.file_path // "") + " " + (.tool_input.command // "")')

PROTECTED_PATTERNS=(".env" "package-lock.json" ".git/")

for pattern in "${PROTECTED_PATTERNS[@]}"; do
	if [[ "$TARGET" == *"$pattern"* ]]; then
		jq -n \
			--arg reason "Blocked: '$TARGET' matches protected pattern '$pattern'" \
			'{decision: "block", reason: $reason}'
		exit 0
	fi
done
exit 0
