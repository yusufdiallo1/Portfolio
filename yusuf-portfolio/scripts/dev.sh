#!/bin/bash
# Kill any process holding port 3000, then wipe .next, then start dev server
echo "⟳ Stopping any running dev server..."
lsof -ti :3000 | xargs kill -9 2>/dev/null || true
pkill -9 -f "next dev" 2>/dev/null || true
pkill -9 -f "next-server" 2>/dev/null || true
sleep 1

echo "⟳ Clearing .next cache..."
rm -rf .next

echo "▲ Starting Next.js dev server..."
exec ./node_modules/.bin/next dev
