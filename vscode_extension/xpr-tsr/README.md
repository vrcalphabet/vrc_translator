# xpr-tsr

.xprファイルと翻訳ファイルをそれぞれ統合するための拡張機能です。
実行は`index.json`をフォーカスした上で、`extension.mergeXprAndTsrFiles`（翻訳用ファイルの統合）コマンドで行います。

`index.json`は以下のプロパティが設定可能です：

`in?: string`  - 入力の相対的なフォルダパス。デフォルトは`./`です。
`out?: string` - 出力先の相対的なフォルダパス。デフォルトは`./`です。
`excludes?: string[]` - 無視する入力フォルダ名。パスではありません。デフォルトは`[]`です。

ディレクトリ例：
```
out/
src/
- index.json
- home/
  - rules.xpr
  - trans.json
- settings/
  - rules.xpr
  - trans.json
```

各フォルダ内は`rules.xpr`と`trans.json`を配置します。前者は翻訳対象要素のxpathが定義されたファイル、後者は翻訳前テキストと翻訳後テキストの対応表を定義したファイルです。この2つのファイル名は変更してはいけません。
このフォルダは、各ページごとや各機能ごとなどに分けることができます。

統合方法：
`../out/`に出力したいため、`index.json`に以下を記述します。
```json
{
  "out": "../out/"
}
```

`index.json`を開きフォーカスした上で、`extension.mergeXprAndTsrFiles`（翻訳用ファイルの統合）を実行します。

`../out/`に統合された`rules.json`と`translations.json`が作成されます。