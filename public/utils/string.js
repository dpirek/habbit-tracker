function htmlEncode(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function markdownToHtml(markdown) {
  // Simple markdown to HTML conversion (for demonstration purposes)
  return markdown
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/\n/gim, '<br>');
}

const html = (input) => {
  return String.raw(input);
}

const css = (strings, ...values) => {
  return String.raw({ raw: strings }, ...values.map(htmlEncode));
}

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    //hour: '2-digit',
    //minute: '2-digit'
  });
}

// Markdown template literal tag
const md = (input) => {
  const rawString = String.raw(input);
  return markdownToHtml(rawString);
}

export { html, css, md, formatDate };