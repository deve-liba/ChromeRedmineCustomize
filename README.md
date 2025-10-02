# Redmine Injector

Redmineのプラグイン [redmine-view-customize](https://github.com/onozaty/redmine-view-customize) と同等の機能を提供するChrome拡張機能です。

複数のRedmineインスタンスに対して、独自のCSSとJavaScriptを適用することができます。設定ごとに有効となるドメインを指定できるため、複数のRedmine環境を横断的にカスタマイズできます。

## 特徴

- 🎨 **CSSカスタマイズ**: Redmineページに独自のスタイルを適用
- 🔧 **JavaScriptカスタマイズ**: 独自のスクリプトを実行して機能を追加・変更
- 🌐 **ドメイン指定**: カスタマイズごとに適用するドメインを指定可能
- 📍 **パス指定**: 特定のパスにのみカスタマイズを適用可能
- 🔄 **複数設定管理**: 複数のカスタマイズ設定を作成・管理
- ✅ **有効/無効切り替え**: 各カスタマイズを個別に有効/無効化
- 💾 **インポート/エクスポート**: 設定のバックアップや共有が可能
- 🔍 **正規表現対応**: ドメインとパスで正規表現とワイルドカード（*）が使用可能

## インストール方法

### 開発者モードでのインストール

1. このリポジトリをクローンまたはダウンロード
   ```
   git clone https://github.com/deve-liba/RedmineInjector.git
   ```

2. アイコンファイルを準備（オプション）
    - `icons/icon16.png` (16x16ピクセル)
    - `icons/icon48.png` (48x48ピクセル)
    - `icons/icon128.png` (128x128ピクセル)
    - アイコンがない場合は、`icons/ICONS_README.txt` を参照してください

3. Chromeで `chrome://extensions/` を開く

4. 右上の「デベロッパーモード」を有効化

5. 「パッケージ化されていない拡張機能を読み込む」をクリック

6. ダウンロードしたフォルダを選択

## 使い方

### 基本的な使い方

1. **設定画面を開く**
    - 拡張機能アイコンをクリックして「設定を開く」ボタンをクリック
    - または、`chrome://extensions/` から「詳細」→「拡張機能のオプション」をクリック

2. **新規カスタマイズを追加**
    - 「新規追加」ボタンをクリック
    - 必要な情報を入力：
        - **名前**: カスタマイズの識別名（例: "ヘッダーの色を変更"）
        - **対象ドメイン**: 適用するドメインを1行1ドメインで入力（例: "redmine.example.com"）
            - 複数ドメイン指定可能（1行1ドメイン）
            - ワイルドカード（*）または正規表現が使用可能
        - **対象パス**: 適用するパス（オプション、例: "/projects/*"）
        - **CSS**: 適用するCSSコード
        - **JavaScript**: 実行するJavaScriptコード
        - **有効**: チェックを入れると即座に適用されます

3. **保存**
    - 「保存」ボタンをクリックして設定を保存

4. **カスタマイズの管理**
    - 編集: 「編集」ボタンで設定を変更
    - 削除: 「削除」ボタンで設定を削除
    - 有効/無効: 「有効化」「無効化」ボタンで切り替え

### ドメイン指定の例

ドメインは**1行1ドメイン**で指定します。複数のドメインパターンを指定でき、いずれかにマッチすれば適用されます。

#### 特定のドメインのみ

```
redmine.example.com
```

#### ワイルドカードを使用

```
*.example.com
```

→ `dev.example.com`、`staging.example.com` など全てのサブドメインに適用

```
redmine-*
```

→ `redmine-dev`、`redmine-staging` などに適用

#### 複数ドメインに同じカスタマイズを適用

```
redmine.example.com
redmine.example.org
redmine-dev.example.com
```

→ 複数の具体的なドメインに適用

```
*.example.com
*.example.org
```

→ 複数のドメイン配下の全サブドメインに適用

#### 正規表現を使用（高度な指定）

```
^redmine-[a-z]+\.example\.com$
```

→ `redmine-dev.example.com`、`redmine-staging.example.com` などにマッチ（正規表現）

```
^(dev|staging)\.example\.com$
```

→ `dev.example.com`、`staging.example.com` のみにマッチ

正規表現パターンは、`^`や`$`などの正規表現記号を含む場合に自動的に正規表現として扱われます。

### パス指定の例

#### 特定のパスのみ

```
/projects/my-project
```

#### ワイルドカードを使用

プロジェクト配下の全ページ:

```
/projects/*
```

課題詳細ページのみ:

```
/issues/*
```

#### 正規表現を使用（高度な指定）

数値IDの課題詳細ページのみ:

```
^/issues/[0-9]+$
```

→ `/issues/123`、`/issues/456` などにマッチ（正規表現）

特定の複数パスにマッチ:

```
^/(issues|projects)$
```

→ `/issues`、`/projects` のみにマッチ

数値IDの課題編集ページのみ:

```
^/issues/[0-9]+/edit$
```

→ `/issues/123/edit`、`/issues/456/edit` などにマッチ

正規表現パターンは、`^`や`$`などの正規表現記号を含む場合に自動的に正規表現として扱われます。

### カスタマイズの例

#### 例1: ヘッダーの背景色を変更

**名前**: ヘッダーの背景色を変更  
**ドメイン**: `redmine.example.com`  
**CSS**:

```css
#header {
    background-color: #2c3e50 !important;
}

#header h1 {
    color: #ecf0f1 !important;
}
```

#### 例2: サイドバーを非表示

**名前**: サイドバーを非表示  
**ドメイン**: `*.example.com`  
**パス**: `/issues/*`  
**CSS**:

```css
#sidebar {
    display: none !important;
}

#content {
    width: 100% !important;
}
```

#### 例3: 課題作成時に自動で説明を入力

**名前**: 課題作成時のテンプレート  
**ドメイン**: `redmine.example.com`  
**パス**: `/projects/*/issues/new`  
**JavaScript**:

```javascript
document.addEventListener('DOMContentLoaded', function () {
    var descriptionField = document.getElementById('issue_description');
    if (descriptionField && descriptionField.value === '') {
        descriptionField.value = '## 概要\n\n## 詳細\n\n## 期待する動作\n\n';
    }
});
```

#### 例4: カスタムボタンを追加

**名前**: クイックアクションボタン  
**ドメイン**: `redmine.example.com`  
**JavaScript**:

```javascript
document.addEventListener('DOMContentLoaded', function () {
    var toolbar = document.querySelector('#content .contextual');
    if (toolbar) {
        var btn = document.createElement('a');
        btn.href = '#';
        btn.className = 'icon icon-add';
        btn.textContent = 'クイックアクション';
        btn.onclick = function (e) {
            e.preventDefault();
            alert('カスタムアクションが実行されました！');
        };
        toolbar.appendChild(btn);
    }
});
```

#### 例5: ステータスごとに色分け

**名前**: ステータスの色分け  
**ドメイン**: `*.example.com`  
**CSS**:

```css
/* 新規 - 青 */
.status-1 {
    background-color: #3498db !important;
    color: white !important;
    padding: 2px 6px;
    border-radius: 3px;
}

/* 進行中 - 黄色 */
.status-2 {
    background-color: #f39c12 !important;
    color: white !important;
    padding: 2px 6px;
    border-radius: 3px;
}

/* 完了 - 緑 */
.status-5 {
    background-color: #27ae60 !important;
    color: white !important;
    padding: 2px 6px;
    border-radius: 3px;
}
```

## インポート/エクスポート

### エクスポート

1. 設定画面で「エクスポート」ボタンをクリック
2. JSON形式のファイルが自動的にダウンロードされます
3. ダウンロードされたファイルを保存するか、他のユーザーと共有

### インポート

1. 設定画面で「インポート」ボタンをクリック
2. JSON形式のファイルを選択
3. 「インポート」ボタンをクリック
4. 既存設定の上書きまたは追加を選択

### サンプル設定

`sample/settings.json` ファイルに実用的なカスタマイズのサンプルが含まれています。

#### サンプル内容

**チケットタイトルにIDを付けてクリップボードコピー機能を付ける**

このサンプルは、Redmineの課題詳細ページ（`/issues/[数字]`）に以下の機能を追加します：

- 課題のタイトル横に「件名をコピー」ボタンを追加
- ボタンをクリックすると、`[#課題ID] 課題タイトル` の形式でクリップボードにコピー
- コピー成功時に「[OK]」と表示

メールやチャットで課題を共有する際に便利な機能です。

#### サンプルの使い方

1. 拡張機能の設定画面で「インポート」ボタンをクリック
2. `sample/settings.json` ファイルを選択
3. 「インポート」をクリック
4. インポートされたカスタマイズを編集して、`domain` フィールドに自分のRedmineのドメインを設定（デフォルトは空欄で全ドメインが対象）
5. 保存して、Redmineの課題ページで動作を確認

## 注意事項

- **セキュリティ**: JavaScriptコードは慎重に記述してください。信頼できないコードは実行しないでください。
- **パフォーマンス**: 複雑なJavaScriptや大量のCSSは、ページの読み込み速度に影響する可能性があります。
- **互換性**: Redmineのバージョンやテーマによって、CSSセレクタやDOM構造が異なる場合があります。
- **同期**: Chrome同期機能を使用している場合、設定は複数のデバイス間で同期されます。

## トラブルシューティング

### カスタマイズが適用されない

1. **ドメインとパスを確認**
    - 拡張機能のポップアップを開いて、現在のページが対象になっているか確認

2. **有効化されているか確認**
    - 設定画面でカスタマイズが「有効」になっているか確認

3. **CSSやJavaScriptの構文エラー**
    - ブラウザの開発者ツール（F12）でコンソールを確認

4. **拡張機能の権限**
    - `chrome://extensions/` で拡張機能に適切な権限が付与されているか確認

5. **ページの再読み込み**
    - 設定を変更した後、対象ページを再読み込み（F5）

## 技術情報

- **Manifest Version**: 3
- **ストレージ**: Chrome Sync Storage（最大100KB）
- **対応ブラウザ**: Google Chrome、Microsoft Edge（Chromium版）
- **CSP（Content Security Policy）対応**:
    - カスタムCSSは`<style>`タグとしてdocumentに直接追加されます
    - カスタムJavaScriptは**バックグラウンドサービスワーカー**を経由して注入されます
    - コンテンツスクリプトがバックグラウンドワーカーにメッセージを送信し、バックグラウンドワーカーが
      `chrome.scripting.executeScript`を使用してコードを実行します
    - **重要**: `world: 'MAIN'`パラメータを使用することで、ページのメインJavaScriptコンテキストでコードが実行されます
    - この方法により、拡張機能の特権を利用してCSP制限を完全にバイパスできます
    - 厳格なCSPポリシー（`'unsafe-inline'`や`'unsafe-eval'`を禁止）を持つRedmineサイトでもエラーなく動作します
    - インラインスクリプトやeval()の使用がCSPで制限されていても、拡張機能による注入は影響を受けません
- **グローバルスコープへの注入**:
    - ユーザーが記述したJavaScriptコードは、ページのグローバルスコープで実行されます
    - 定義した関数や変数はグローバルオブジェクト（`window`）に追加され、どこからでもアクセス可能です
    - これにより、`onclick="myFunction()"` のようなインラインイベントハンドラから関数を呼び出すことができます
    - 例: `function copy_subject_support() { ... }` と定義すると、HTML属性から `onclick="copy_subject_support(this)"`
      で呼び出せます
- **アーキテクチャ**:
    - `content.js`: ページに注入されるコンテンツスクリプト。カスタマイズ設定を読み込み、適用対象を判定
    - `background.js`: バックグラウンドサービスワーカー。JavaScriptコードの実行を担当
    - CSPをバイパスするため、JavaScriptの注入は必ずバックグラウンドワーカー経由で行われます

## テスト方法

拡張機能の動作をテストするには、同梱の `test.html` ファイルをブラウザで開いてください。

1. `test.html` をブラウザで開く（ファイルプロトコルまたはローカルサーバー経由）
2. ページ内の指示に従ってテスト用のカスタマイズを設定
3. ページをリロードして動作を確認
4. ブラウザの開発者ツール（F12）でCSPエラーがないことを確認

このテストページでは、JavaScriptとCSSのインジェクションが正常に動作することを視覚的に確認できます。

## ファイル構成

```
RedmineInjector/
├── manifest.json          # 拡張機能の設定ファイル
├── content.js            # コンテンツスクリプト（カスタマイズの適用）
├── background.js         # バックグラウンドサービスワーカー（JavaScript注入）
├── options.html          # 設定画面のHTML
├── options.css           # 設定画面のCSS
├── options.js            # 設定画面のJavaScript
├── popup.html            # ポップアップのHTML
├── popup.js              # ポップアップのJavaScript
├── test.html             # テストページ（動作確認用）
├── icons/                # アイコンファイル
│   ├── icon16.png
│   ├── icon48.png
│   ├── icon128.png
│   └── ICONS_README.txt
├── sample/               # サンプル設定
│   └── settings.json     # カスタマイズのサンプル（インポート用）
├── LICENSE
└── README.md
```

## ライセンス

このプロジェクトのライセンスについては、LICENSEファイルを参照してください。

## 参考

- [redmine-view-customize](https://github.com/onozaty/redmine-view-customize) - 元となったRedmineプラグイン
- [Chrome Extensions Documentation](https://developer.chrome.com/docs/extensions/)

## 貢献

バグ報告、機能リクエスト、プルリクエストを歓迎します！

## 更新履歴

### Version 1.0.0

- 初回リリース
- CSSとJavaScriptのカスタマイズ機能
- ドメインとパスの指定機能
- インポート/エクスポート機能
- 有効/無効切り替え機能
