import type { Component } from 'svelte';

export type PageTheme = 'default';

export type PageMeta = {
  title: string;
  description?: string;
  theme: PageTheme;
};

export type MarkdownHtmlBlock = {
  kind: 'html';
  html: string;
};

export type MarkdownComponentBlock<Props = Record<string, unknown>> = {
  kind: 'component';
  name: string;
  props: Props;
};

export type RenderedBlock = MarkdownHtmlBlock | MarkdownComponentBlock;

export type RenderedPage = {
  slug: string;
  meta: PageMeta;
  blocks: RenderedBlock[];
};

export type PageSummary = {
  slug: string;
  title: string;
  description?: string;
};

export type MarkdownComponentDefinition<Props extends Record<string, unknown>> = {
  component: Component<any>;
  parse: (attributes: Record<string, unknown>, body: string) => Props;
};
