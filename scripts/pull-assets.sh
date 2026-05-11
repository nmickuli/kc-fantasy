#!/usr/bin/env bash
#
# Pull the three Figma MCP bitmap assets into public/assets/.
# These URLs are signed and expire ~7 days after Claude generated them
# (2026-05-10) — re-pull from the Figma MCP if these 404 by 2026-05-17.
#
# Run from the project root:
#   bash scripts/pull-assets.sh

set -euo pipefail

cd "$(dirname "$0")/.."
mkdir -p public/assets

echo "Pulling welcome background (player photo)..."
curl -sL -f -o public/assets/welcome-bg.png \
  "https://www.figma.com/api/mcp/asset/93a41356-b0e3-41e7-bb11-95f028e6bd83"

echo "Pulling background swirl pattern..."
curl -sL -f -o public/assets/bg-pattern.png \
  "https://www.figma.com/api/mcp/asset/9d0218ee-a666-4e06-8729-b6a262cceda5"

echo "Pulling KC Current crest..."
curl -sL -f -o public/assets/kc-crest.png \
  "https://www.figma.com/api/mcp/asset/8c68d8d4-6261-4c13-b1d3-8b9b70015d19"

echo "Pulling soccer pitch (SelectTeam background)..."
curl -sL -f -o public/assets/pitch.png \
  "https://www.figma.com/api/mcp/asset/abc23f9d-9015-4bc8-804b-84610dc251a2"

echo "Pulling player photos (5 real KC Current player headshots, cycled across 16 players)..."
curl -sL -f -o public/assets/player-edmonds.png \
  "https://www.figma.com/api/mcp/asset/a57feee1-4587-46fd-aa09-f86ceaa7ea30"
curl -sL -f -o public/assets/player-labonta.png \
  "https://www.figma.com/api/mcp/asset/70c63e88-d668-42cd-b6a8-b636d5b931e7"
curl -sL -f -o public/assets/player-winebrenner.png \
  "https://www.figma.com/api/mcp/asset/b25dc522-96d5-4399-bbe8-f4ef31473cb2"
curl -sL -f -o public/assets/player-johnson.png \
  "https://www.figma.com/api/mcp/asset/d4a3b43f-9cca-4c9c-9168-81188b415a97"
curl -sL -f -o public/assets/player-mccain.png \
  "https://www.figma.com/api/mcp/asset/35bddc6f-4839-4540-8ba5-c24321050e42"

echo
echo "Done. Files in public/assets/:"
ls -lh public/assets/
echo
echo "Next: uncomment the background-image rule in src/styles/index.css"
echo "to swap the solid teal fallback for the swirl pattern."
