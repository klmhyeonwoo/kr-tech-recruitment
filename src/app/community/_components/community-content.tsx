import type React from "react";
import { parseCommunityContent } from "@/lib/community/document";

export default function CommunityContent({ content }: { content: string }) {
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
