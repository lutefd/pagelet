import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkDirective from 'remark-directive';
import remarkRehype from 'remark-rehype';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import type { Schema } from 'hast-util-sanitize';
import rehypeShiki from '@shikijs/rehype';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import type { Root, RootContent } from 'mdast';
import { markdownComponents } from './components';
import type { RenderedBlock } from './types';

type DirectiveNode = RootContent & {
  name?: string;
  attributes?: Record<string, unknown>;
  children?: RootContent[];
};

const htmlSchema: Schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code ?? []), ['className']],
    pre: [...(defaultSchema.attributes?.pre ?? []), ['className']],
    span: [
      ...(defaultSchema.attributes?.span ?? []),
      ['className'],
      ['style']
    ]
  }
};

export async function renderMarkdownDocument(markdown: string): Promise<RenderedBlock[]> {
  const tree = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkDirective)
    .parse(normalizePageletDirectives(markdown)) as Root;
  const blocks: RenderedBlock[] = [];
  let markdownBuffer: RootContent[] = [];

  async function flushMarkdown() {
    if (markdownBuffer.length === 0) {
      return;
    }

    const html = await renderMarkdownChildren(markdownBuffer);
    if (html.trim()) {
      blocks.push({ kind: 'html', html });
    }
    markdownBuffer = [];
  }

  for (const child of tree.children) {
    if (isContainerDirective(child)) {
      await flushMarkdown();
      blocks.push(renderComponentBlock(child));
    } else {
      markdownBuffer.push(child);
    }
  }

  await flushMarkdown();
  return blocks;
}

function normalizePageletDirectives(markdown: string): string {
  return markdown
    .split('\n')
    .map((line) => {
      if (/^::[a-z][\w-]*(?:\{.*\})?\s*$/.test(line.trim())) {
        return line.replace('::', ':::');
      }

      if (line.trim() === '::') {
        return line.replace('::', ':::');
      }

      return line;
    })
    .join('\n');
}

async function renderMarkdownChildren(children: RootContent[]): Promise<string> {
  const tree: Root = {
    type: 'root',
    children: structuredClone(children)
  };

  visit(tree, (node) => {
    if (isDirective(node)) {
      throw new Error(`Directive ::${node.name ?? 'unknown'} must be a top-level registered component block`);
    }
  });

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeShiki, { theme: 'github-light' })
    .use(rehypeSanitize, htmlSchema)
    .use(rehypeStringify)
    .run(tree);

  return unified().use(rehypeStringify).stringify(file);
}

function renderComponentBlock(node: DirectiveNode): RenderedBlock {
  const name = node.name;
  if (!name || !(name in markdownComponents)) {
    throw new Error(`Unknown Markdown component ::${name ?? 'unknown'}`);
  }

  const definition = markdownComponents[name as keyof typeof markdownComponents];
  const body = renderPlainMarkdown(node.children ?? []);

  return {
    kind: 'component',
    name,
    props: definition.parse(node.attributes ?? {}, body)
  };
}

function renderPlainMarkdown(children: RootContent[]): string {
  return children.map((child) => nodeText(child)).join('\n').trim();
}

function nodeText(node: unknown): string {
  if (typeof node !== 'object' || node === null) {
    return '';
  }

  if ('value' in node && typeof node.value === 'string') {
    return node.value;
  }

  if ('children' in node && Array.isArray(node.children)) {
    const separator = 'type' in node && node.type === 'list' ? '\n' : '';
    return node.children.map((child) => nodeText(child)).filter(Boolean).join(separator);
  }

  return '';
}

function isDirective(node: unknown): node is DirectiveNode {
  return (
    typeof node === 'object' &&
    node !== null &&
    'type' in node &&
    typeof node.type === 'string' &&
    node.type.endsWith('Directive')
  );
}

function isContainerDirective(node: RootContent): node is DirectiveNode {
  return node.type === 'containerDirective';
}
