# Antigravity Mobile Game Project Kickoff Instruction

このドキュメントは、Antigravityを使用して新しいモバイルWebゲームプロジェクトを立ち上げる際の標準的な指示書です。
以下の内容をAntigravityへの最初のプロンプトとして使用することで、今回（prototype002）と同じ高品質な構成でプロジェクトを開始できます。

---

## 🚀 新規プロジェクト開始用プロンプト

以下のテキストをコピーして、新しいプロジェクトの最初にAntigravityに送信してください。

```markdown
# プロジェクト概要
モバイルファーストのWebゲームプロトタイプを作成したい。
「antigravity-prototype002」で確立された以下の標準構成に従って初期セットアップを行ってください。

# 必須要件リスト

## 1. 技術スタック & 環境
- **Build Tool**: Vite (Vanilla JS)
- **Config**: `vite.config.js` で `host: true` を設定し、ローカルネットワークからのアクセスを許可すること。
- **Git**: Node.js, OS, Editor (VSCode) 用の標準的な `.gitignore` を生成。

## 2. ディレクトリ構造
以下のように責務を分離すること。
- `src/core/`: ゲームロジック、状態管理 (State.js, SoundManager.js など)
- `src/ui/`: DOM操作、レンダリング (CounterDisplay.js など)
- `public/`: 静的アセット (manifest.json, icons)

## 3. モバイル最適化 (重要)
- **Viewport**: `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">`
- **CSS**:
    - `touch-action: manipulation`
    - `user-select: none`
    - `overflow: hidden` (スクロール防止)
- **Input**: `click` イベントではなく `pointerdown` を使用して遅延を防ぐこと。

## 4. PWA (Progressive Web App) 化
iPhone/Androidのホーム画面に追加できるようにする。
- `manifest.json` の作成 (display: standalone)。
- `index.html` への `apple-mobile-web-app-capable` 等のメタタグ追加。
- 簡易的なアイコン (SVG等) の生成と設定。

## 5. オーディオ
- **Web Audio API** を使用した `SoundManager` クラスを実装すること。
- 素材フィルを使わず、プロシージャル（コード生成）な効果音（タップ音など）を実装し、即座にフィードバックが得られるようにすること。
- ユーザーインタラクション時の再開処理 (`resume()`) を入れること。

## 6. 開発フロー
- サーバー起動時にQRコードを表示し、実機確認をスムーズに行えるようにする。

以上の構成で、まずは「画面中央をタップすると反応する」最小限のプロトタイプを構築してください。
```

---

## 主な実装ポイントの解説（Antigravity向けメモ）

### SoundManager (Procedural Audio)
外部mp3ファイルを使わず、オシレーターで音を作ることで、ロード時間をゼロにし、アセット管理の手間を省く。
```javascript
// 短い「ポンッ」という音を作る例
const osc = ctx.createOscillator();
const gain = ctx.createGain();
osc.frequency.setValueAtTime(600, t);
osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
gain.gain.setValueAtTime(0, t);
gain.gain.linearRampToValueAtTime(1, t + 0.01);
gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
```

### Mobile Input
モバイルでは `click` イベントに300msの遅延が発生する場合があるため、必ず `pointerdown` を使う。
```javascript
element.addEventListener('pointerdown', (e) => {
    // タッチ時の処理
});
```
