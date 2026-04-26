export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function attachRowClickHandlers(
  container: HTMLElement,
  navigate: (url: string) => void
): void {
  container.querySelectorAll<HTMLTableRowElement>('.mb-clickable-row').forEach(row => {
    row.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', e => e.stopPropagation());
    });
    row.addEventListener('click', () => {
      const href = row.dataset.href;
      if (href) navigate(href);
    });
  });
}
