import { XprErrorMessageGroup } from './xpr';

export default {
  GENERAL: {
    MISSING_METADATA: '@nameと@includesの指定は必須です。',
    AFTER_COMPLETE: 'ノード定義部分にメタデータを定義することはできません。',
    INVALID_TOKEN: '無効なトークンです。',
    INVALID_TOKEN_END: 'トークンをここで終わらすことはできません。',
  },
  NAME: {
    DUPLICATE: '@nameを2度宣言することはできません。',
    MISSING_IDENTIFIER: '@nameの後に識別子が指定されていません。',
    INVALID_FORMAT: '@name識別子は英数字またはアンダースコア`_`の組み合わせでなければいけません。',
    MISSING_COMMA: '@name識別子の後はカンマ`,`もしくは改行を入れなければいけません。',
  },
  INCLUDES: {
    DUPLICATE: '@includesを2度宣言することはできません。',
    BLOCK_NOT_STARTED: '@includesブロックが開始されていません。',
    MISSING_DIRECTORY: '@includesブロックが終了されていません。',
    EMPTY_DIRECTORIES: '@includesにはディレクトリを最低でも1つ指定する必要があります。',
    INVALID_FORMAT: '@includesで指定するディレクトリはスラッシュ`/`から始める必要があります。',
    MISSING_COMMA: '@includesの各ディレクトリの後はカンマ`,`もしくは改行を入れなければいけません。',
  },
  EXCLUDES: {
    DUPLICATE: '@excludesを2度宣言することはできません。',
    BLOCK_NOT_STARTED: '@excludesブロックが開始されていません。',
    MISSING_DIRECTORY: '@excludesブロックが終了されていません。',
    INVALID_FORMAT: '@excludesで指定するディレクトリはスラッシュ`/`から始める必要があります。',
    MISSING_COMMA: '@excludesの各ディレクトリの後はカンマ`,`もしくは改行を入れなければいけません。',
  },
  NODE: {
    MISSING_XPATH: 'xpathが指定されていません。',
    MISSING_KEY_OR_XPATH: 'keyまたはxpathが指定されていません。',
    MISSING_NODE: 'ネストの中に最低でも1つのノードが必要です。',
  },
} as const satisfies XprErrorMessageGroup;
