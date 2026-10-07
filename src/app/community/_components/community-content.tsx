import type React from "react";
import {
  parseCommunityContent,
  parseCommunityDocument,
  type CommunityDocumentNode,
} from "@/lib/community/document";

function renderMarks(
  node: CommunityDocumentNode,
  key: string,
): React.ReactNode {
  let content: React.ReactNode = node.text ?? "";

  node.marks?.forEach((mark, index) => {
    const markKey = `${key}-mark-${index}`;

    if (mark.type === "bold") content = <strong key={markKey}>{content}</strong>;
    if (mark.type === "italic") content = <em key={markKey}>{content}</em>;
    if (mark.type === "code") content = <code key={markKey}>{content}</code>;
    if (mark.type === "link" && typeof mark.attrs?.href === "string") {
      content = (
        <a href={mark.attrs.href} key={markKey} target="_blank" rel="noreferrer">
          {content}
        </a>
      );
    }
  });

  return content;
}

function renderNode(node: CommunityDocumentNode, key: string): React.ReactNode {
  const children = node.content?.map((child, index) =>
    renderNode(child, `${key}-${index}`),
  );

  switch (node.type) {
    case "text":
      return <>{renderMarks(node, key)}</>;
    case "paragraph":
      return <p key={key}>{children}</p>;
    case "heading":
      return <h2 key={key}>{children}</h2>;
    case "bulletList":
      return <ul className="board__content__list" key={key}>{children}</ul>;
    case "orderedList":
      return <ol className="board__content__list" key={key}>{children}</ol>;
    case "listItem":
      return <li key={key}>{children}</li>;
    case "blockquote":
      return <blockquote key={key}>{children}</blockquote>;
    case "hardBreak":
      return <br key={key} />;
    default:
      return <>{children}</>;
  }
}

export default function CommunityContent({ content }: { content: string }) {
  const document = parseCommunityDocument(content);

  if (document) {
    return <div className="board__content">{renderNode(document, "document")}</div>;
  }

  const blocks = parseCommunityContent(content);
  const nodes: React.ReactNode[] = [];
  let bullets: typeof blocks = [];

  const flushBullets = () => {
    if (!bullets.length) return;
    nodes.push(
      <ul className="board__content__list" key={`list-${nodes.length}`}>
        {bullets.map((block) => (
          <li key={block.id}>{block.text}</li>
        ))}
      </ul>,
    );
    bullets = [];
  };

  blocks.forEach((block) => {
    if (block.type === "bullet") {
      bullets.push(block);
      return;
    }

    flushBullets();

    if (block.type === "heading") {
      nodes.push(<h2 key={block.id}>{block.text}</h2>);
      return;
    }

    if (block.type === "quote") {
      nodes.push(<blockquote key={block.id}>{block.text}</blockquote>);
      return;
    }

    nodes.push(<p key={block.id}>{block.text}</p>);
  });

  flushBullets();
  return <div className="board__content">{nodes}</div>;
}
