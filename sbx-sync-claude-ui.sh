#!/bin/bash
# Copy the host Claude Code theme and status line into a Docker Sandbox (sbx).
# Usage: ./sbx-sync-claude-ui.sh [sandbox-name]   (default: sandbox)
set -euo pipefail

SANDBOX="${1:-sandbox}"
HOST_CLAUDE="$HOME/.claude"
SBX_HOME="/home/agent/.claude"

# Theme name is read from the host settings so the two stay in sync.
THEME=$(jq -r '.theme // empty' "$HOST_CLAUDE/settings.json")
THEME_FILE="${THEME#custom:}"

[ -f "$HOST_CLAUDE/statusline.sh" ] || { echo "missing $HOST_CLAUDE/statusline.sh" >&2; exit 1; }
command -v sbx >/dev/null || { echo "sbx not found" >&2; exit 1; }

echo "Syncing to sandbox '$SANDBOX'..."
sbx exec "$SANDBOX" bash -c "mkdir -p $SBX_HOME/themes"

sbx cp "$HOST_CLAUDE/statusline.sh" "$SANDBOX:$SBX_HOME/statusline.sh"
if [[ "$THEME" == custom:* ]]; then
	sbx cp "$HOST_CLAUDE/themes/$THEME_FILE.json" "$SANDBOX:$SBX_HOME/themes/$THEME_FILE.json"
fi

# Merge into the sandbox settings; sbx-managed keys (apiKeyHelper, hooks, ...) are kept.
# The wrapper still calls sbx's own status hook, then runs the host status line script.
sbx exec "$SANDBOX" env THEME="$THEME" bash -s <<'EOF'
set -euo pipefail
cd ~/.claude

cat > statusline-wrapper.sh <<'WRAP'
#!/bin/bash
input=$(cat)
printf "%s" "$input" | /usr/local/bin/sbx-claude-hook claude-status >/dev/null 2>&1
printf "%s" "$input" | bash "$HOME/.claude/statusline.sh"
WRAP
chmod +x statusline-wrapper.sh

[ -f settings.json.pre-theme.bak ] || cp settings.json settings.json.pre-theme.bak

tmp=$(mktemp)
jq --arg theme "$THEME" --arg cmd "bash $HOME/.claude/statusline-wrapper.sh" \
	'(if $theme != "" then .theme = $theme else . end) | .statusLine = {type: "command", command: $cmd}' \
	settings.json > "$tmp"
cat "$tmp" > settings.json
rm -f "$tmp"
EOF

echo "Done. Restart the Claude session in the sandbox (sbx run claude) to apply."
