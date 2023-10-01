export function cloneTemplate(selector: string): DocumentFragment {
  const template = document.querySelector<HTMLTemplateElement>(selector);
  const fragment = template.content.cloneNode(true) as DocumentFragment;
  return fragment;
}
