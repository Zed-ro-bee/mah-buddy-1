"use client";

function inline(text: string) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_)/g);
  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) return <code key={index}>{part.slice(1, -1)}</code>;
    if ((part.startsWith("**") && part.endsWith("**")) || (part.startsWith("__") && part.endsWith("__"))) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if ((part.startsWith("*") && part.endsWith("*")) || (part.startsWith("_") && part.endsWith("_"))) return <em key={index}>{part.slice(1, -1)}</em>;
    return <span key={index}>{part}</span>;
  });
}

export default function MarkdownMessage({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: React.ReactNode[] = [];
  let list: { ordered: boolean; text: string }[] = [];

  const flush = () => {
    if (!list.length) return;
    const ordered = list[0].ordered;
    const Tag = ordered ? "ol" : "ul";
    blocks.push(<Tag key={`list-${blocks.length}`}>{list.map((item, i) => <li key={i}>{inline(item.text)}</li>)}</Tag>);
    list = [];
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    const ordered = /^\d+[.)]\s+/.test(trimmed);
    const unordered = /^[-*•]\s+/.test(trimmed);
    if (ordered || unordered) {
      const type = ordered;
      if (list.length && list[0].ordered !== type) flush();
      list.push({ ordered: type, text: trimmed.replace(type ? /^\d+[.)]\s+/ : /^[-*•]\s+/, "") });
      return;
    }
    flush();
    if (!trimmed) {
      blocks.push(<div className="md-spacer" key={`space-${index}`} />);
    } else if (/^###\s+/.test(trimmed)) {
      blocks.push(<h4 key={index}>{inline(trimmed.replace(/^###\s+/, ""))}</h4>);
    } else if (/^##\s+/.test(trimmed)) {
      blocks.push(<h3 key={index}>{inline(trimmed.replace(/^##\s+/, ""))}</h3>);
    } else if (/^#\s+/.test(trimmed)) {
      blocks.push(<h2 key={index}>{inline(trimmed.replace(/^#\s+/, ""))}</h2>);
    } else {
      blocks.push(<p key={index}>{inline(trimmed)}</p>);
    }
  });
  flush();

  return <div className="markdown-message">{blocks}</div>;
}
