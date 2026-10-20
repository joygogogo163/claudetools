#!/bin/bash
# 构建 VibeSlash.app（arm64 + x86_64 通用二进制），再打成 dmg 和 zip，输出到 build/。
# 用法：scripts/bundle.sh [版本号]；只能在 macOS 上运行。
set -euo pipefail
cd "$(dirname "$0")/.."

VERSION="${1:-$(node -p "require('./package.json').version" 2>/dev/null || true)}"
VERSION="${VERSION:-0.1.0}"
BUILD="$(git rev-list --count HEAD 2>/dev/null || echo 1)"
ARCHS=(--arch arm64 --arch x86_64)

swift build -c release "${ARCHS[@]}" --product VibeSlash
BIN_DIR="$(swift build -c release "${ARCHS[@]}" --show-bin-path)"

APP=build/VibeSlash.app
rm -rf build
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources"
cp "$BIN_DIR/VibeSlash" "$APP/Contents/MacOS/VibeSlash"
# SwiftPM 的资源包放进 Resources（放在 .app 根目录会导致签名失败），Catalog 会先在这里找
cp -R "$BIN_DIR/VibeSlash_VibeSlashCore.bundle" "$APP/Contents/Resources/"
cp bundle/AppIcon.icns "$APP/Contents/Resources/AppIcon.icns"
sed -e "s/__VERSION__/$VERSION/" -e "s/__BUILD__/$BUILD/" bundle/Info.plist > "$APP/Contents/Info.plist"

# 临时签名（ad-hoc）：没有开发者证书时也能在本机运行；正式分发需要用 Developer ID 签名并公证
codesign --force --deep --sign - --options runtime "$APP"
codesign --verify --deep --strict "$APP"

# dmg：拖进「应用程序」安装
STAGE=build/dmg
mkdir -p "$STAGE"
cp -R "$APP" "$STAGE/"
ln -s /Applications "$STAGE/Applications"
hdiutil create -volname "VibeSlash" -srcfolder "$STAGE" -ov -format UDZO "build/VibeSlash-$VERSION-macos.dmg"
rm -rf "$STAGE"
(cd build && ditto -c -k --keepParent VibeSlash.app "VibeSlash-$VERSION-macos.zip")
ls -la build
