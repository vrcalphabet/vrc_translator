export default {
  NAME_DUPLICATE: '@nameを2度宣言することはできません。',
  NAME_MISSING_IDENTIFIER: '@nameの後に識別子が指定されていません。',
  NAME_INVALID_FORMAT: '@name識別子は英数字またはアンダースコア`_`の組み合わせでなければいけません。',
  NAME_MISSING_COMMA: '@name識別子の後はカンマ`,`もしくは改行を入れなければいけません。',
  INCLUDES_DUPLICATE: '@includesを2度宣言することはできません。',
  INCLUDES_BLOCK_NOT_STARTED: '@includesブロックが開始されていません。',
  INCLUDES_EMPTY_DIRECTORIES: '@includesにはディレクトリを最低でも1つ指定する必要があります。',
  INCLUDES_MISSING_DIRECTORY: '@includesブロックが終了されていません。',
  INCLUDES_INVALID_FORMAT: '@includesで指定するディレクトリはスラッシュ`/`から始める必要があります。',
  INCLUDES_MISSING_COMMA: '@includesの各ディレクトリの後はカンマ`,`もしくは改行を入れなければいけません。',
} as const;