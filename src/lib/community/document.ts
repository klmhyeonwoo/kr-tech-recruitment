export type CommunityBlockType = "paragraph" | "heading" | "bullet" | "quote";

export type CommunityBlock = {
  id: string;
  type: CommunityBlockType;
  text: string;
};

const createId = (index: number) => `block-${index}`;

export function createEmptyBlock(index = 0): CommunityBlock {
  return { id: createId(index), type: "paragraph", text: "" };
}

export function serializeCommunityBlocks(blocks: CommunityBlock[]) {
  return blocks
    .map(({ type, text }) => {
      const trimmed = text.trim();
      if (!trimmed) return "";
      if (type === "heading") return `## ${trimmed}`;
      if (type === "bullet") return `- ${trimmed}`;
      if (type === "quote") return `> ${trimmed}`;
      return trimmed;
    })
    .filter(Boolean)
    .join("\n\n");
}

export function parseCommunityContent(content: string): CommunityBlock[] {
  const blocks: CommunityBlock[] = [];
  let paragraphLines: string[] = [];

  const appendParagraph = () => {
    const text = paragraphLines.join("\n").trim();
    if (text) {
      blocks.push({ id: createId(blocks.length), type: "paragraph", text });
    }
    paragraphLines = [];
  };

  content.split(/\r?\n/).forEach((line) => {
    const heading = line.match(/^#{1,2}\s+(.+)/);
    const bullet = line.match(/^[-*•]\s+(.+)/);
    const quote = line.match(/^>\s?(.+)/);

    if (heading || bullet || quote) {
      appendParagraph();
      blocks.push({
        id: createId(blocks.length),
        type: heading ? "heading" : bullet ? "bullet" : "quote",
        text: (heading?.[1] ?? bullet?.[1] ?? quote?.[1] ?? "").trim(),
      });
      return;
    }

    if (!line.trim()) {
      appendParagraph();
      return;
    }

    paragraphLines.push(line);
  });

  appendParagraph();
  return blocks.length ? blocks : [createEmptyBlock()];
}
