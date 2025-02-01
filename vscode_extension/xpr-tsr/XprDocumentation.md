# xpr 仕様書

xpath を定義するためのファイル（xpath rule definition file）です。

## 目的

サイトを翻訳する際の翻訳対象要素を選択するために使用する xpath を記述するためのファイルです。

## 定義

`<>`は必須の変数です。
`[]`は任意で指定できる変数です。
`...`は可変長の配列です。この記号の前の変数を任意の回数繰り返すことができます。
`,`は変数の区切りを表す記号で、実際は改行`\n`です。`,`は省略できません。

変数の順番は入れ替えることができません。

## 変数の定義

- `comment`
  改行`\n`を除く任意の文字列です。
- `comment-block`
  改行を含む任意の文字列です。`-%`はコメントの終わりと判断されるため使用できません。
- `identifier`
  何らかを識別するための文字列です。英数字とアンダースコア`_`が使用できます。識別子のため、大文字にすべきです。
- `directory-path`
  ディレクトリのパスを指定する文字列です。ASCII 文字以外や空白記号を指定する場合は URL エンコードを行ってください。
  必ずスラッシュ`/`から始める必要があります。
  ワイルドカードが指定でき、`/@d`は１つの階層のパスを、`/@p`は１つ以上の階層のパスを、`/@f`は任意のファイルを指定できます。
  例:
  - `/home/@d` → `/home/login`にマッチし、`/home`や`/home/settings/account`にはマッチしません。
  - `/home/@p` → `/home/register`や`/home/settings/account`にマッチし、`/home`にはマッチしません。
  - `/home/@f` → `/home`や`/home/login.php`にマッチし、`/home/login`にはマッチしません。
- `key`
  ノードを識別するための文字列です。英数字とアンダースコア`_`が使用できます。
  キーは重複可能ですが、ノードとネストでの併用はできません。また、識別子のため、大文字にすべきです。
- `xpath`
  実際の xpath です。必ずスラッシュ`/`から始める必要があります。
- `multiSelect`
  要素を複数選択するかどうかを指定します。`*`を指定すると xpath にマッチする要素すべて、省略すると、最初にマッチした要素のみを選択します。
- `attribute`
  要素のテキストを別の言語に置換するときに、指定した属性の値を置換するようにします。
  省略時は`.textContent = 値`で、`[属性名]`とすると`.setAttribute(属性名, 値)`となります。

## 基本構文

- コメントの定義

  - `%`
    行コメントです。コンバータは、この記号から改行`\n`までの文字列を無視（削除）して出力します。
    - `% <comment>`
  - `%- -%`
    コメントブロックです。コンバータは、`%-`から`-%`までの改行を含む文字列を無視（削除）して出力します。
    - `%- <comment-block> -%`

- メタデータの定義
  ファイルがどのような振る舞いをしてほしいかを定義します。
  メタデータはファイルの先頭に記述し、**ノードより後に記述することはできません**。

  - `@name`
    ファイルを識別するための識別子です。通常はフォルダ名を大文字にしたものと同じにすべきです。この項目は省略できません。
    - `@name <identifier>,`
  - `@includes`
    要素の選択を実行する対象の URL のディレクトリパスです。
    これは改行区切りで複数指定できます。パスは最低でも１つ必要です。
    この項目は省略できません。
    - `@includes { <directory-path>, [directory-path], ... }`
  - `@excludes`
    `@includes`にマッチしたパスのうち、要素の選択を実行**しない**URL のディレクトリパスです。
    `@includes`と同じく改行区切りで複数指定できます。
    - `@excludes { [directory-path], ... }`

- ノードの定義
  - ノード (`node`変数と同義です)
    xpath で要素を選択する一つのノードです。ネストされている場合、親のネストで指定されている xpath と multiSelect を継承します。
    ネストされていないノード（親がいないノード）では`key`を省略することはできません。
    - `[key] <xpath> [multiSelect] [attribute],`
  - ノードのネスト
    指定した xpath の中に複数のノードを含めることができます。ネストされている場合、親のネストで指定されている xpath と multiSelect を継承します。
    - `<key> <xpath> [multiSelect] { <node>, [node], ... }`

## xpath の省略記法

- id の指定
  `div[@id="test"]`は`div#test`と省略することができます。
- クラス名の指定
  `div[contains(concat(" ", normalize-space(@class), " "), " test ")]`は`div.test`と省略することができます。
- 範囲指定
  `div[position() >= 1 and position() <= 4]`は`div[1:4]`と省略することができます。
  `div[position() = 1 or position() = 3]`は`div[1,3]`と省略することができます。
  注: `[1,2]`や`[1:2]`を使用した場合、マルチセレクタ`*`を付与しなければいけません。ただし、省略してもコンバータはエラーを出しません。

## 実際の例

```
@name REGISTER
@includes {
  /home/register
}

% アカウント登録画面
FORM //form[1]/div[1] {
  % タイトル
  TITLE /h4[1]
  % 入力欄
  REGISTER_INPUT /div[2:3]/input.e1buxcrw1[1] * [placeholder]
  % 誕生月
  AGE_MONTH //select#age_month/option *
  % 利用規約
  CONSENT /div[5]/label.eazy3iu0[1] * {
    /p[1]/text()[1,4]
    /p[1]/a[1:3]
  }
}
```

上記の xpr ファイルを変換すると以下の中間的な JSON が得られます。

```json
{
  "name": "REGISTER",
  "includes": ["/home/register"],
  "excludes": [],
  "nodes": [
    {
      "key": "FORM",
      "xpath": "//form[1]/div[1]",
      "nodes": [
        { "key": "TITLE", "xpath": "/h4[1]", "multi": false, "attribute": null },
        {
          "key": "REGISTER_INPUT",
          "xpath": "/div[2:3]/input.e1buxcrw1[1]",
          "multi": true,
          "attribute": "placeholder"
        },
        {
          "key": "AGE_MONTH",
          "xpath": "//select#age_month/option",
          "multi": true,
          "attribute": null
        },
        {
          "key": "CONSENT",
          "xpath": "/div[5]/label.eazy3iu0[1]",
          "nodes": [
            { "key": null, "xpath": "/p[1]/text()[1,4]", "multi": true, "attribute": null },
            { "key": null, "xpath": "/p[1]/a[1:3]", "multi": true, "attribute": null }
          ]
        }
      ]
    }
  ]
}
```
