import { IndexDefinition } from '.';
import Console from './Console';
import { z } from 'zod';

export default class IndexValidator {
  private static readonly schema = z.object({
    input: z.string().default('./'),
    output: z.string().default('./'),
    ignore: z.array(z.string()).default([]),
    format: z.boolean().default(false),
  });

  public static validate(input: string): IndexDefinition | null {
    try {
      const index = JSON.parse(input);
      return this.schema.parse(index) as IndexDefinition;
    } catch (e: any) {
      if (e instanceof z.ZodError) {
        Console.error('`index.json`のスキーマが不正です。', e.errors);
      } else {
        Console.error('`index.json`の構文が不正です。', e.message);
      }
      return null;
    }
  }
}
