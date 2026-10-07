export type CommunityBlockType = "paragraph" | "heading" | "bullet" | "quote";

export type CommunityBlock = {
  id: string;
  type: CommunityBlockType;
  text: string;
};

export type CommunityDocumentNode = {
  type: string;
  text?: string;
  attrs?: Record<string, unknown>;
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
  content?: CommunityDocumentNode[];
};

export type CommunityDocument = CommunityDocumentNode & {
  type: "doc";
};

const DOCUMENT_MARKER = "nklcb-document";
const createId = (index: number) => `block-${index}`;

export function createEmptyCommunityDocument(): CommunityDocument {
  return {
    type: "doc",
    content: [{ type: "paragraph" }],
  };
}

export function serializeCommunityDocument(document: CommunityDocument) {
  return JSON.stringify({
    type: DOCUMENT_MARKER,
    version: 1,
    document,
  });
}

export function parseCommunityDocument(content: string): CommunityDocument | null {
  try {
    const parsed = JSON.parse(content) as {
      type?: unknown;
      document?: unknown;
    };

    if (
      parsed.type === DOCUMENT_MARKER &&
      isCommunityDocument(parsed.document)
    ) {
      return parsed.document;
    }

    if (isCommunityDocument(parsed)) {
      return parsed;
    }
  } catch {
    // Text posts created before the document editor are handled below.
  }

  return null;
}

export function getCommunityPlainText(content: string) {
  const document = parseCommunityDocument(content);

  if (document) {
    return getNodeText(document).replace(/\s+/g, " ").trim();
  }

  return parseCommunityContent(content)
    .map((block) => block.text)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function getNodeText(node: CommunityDocumentNode): string {
  if (node.type === "text") return node.text ?? "";
  if (node.type === "hardBreak") return "\n";

  const text = node.content?.map(getNodeText).join("") ?? "";
  const isBlock = [
    "paragraph",
    "heading",
    "bulletList",
    "orderedList",
    "listItem",
    "blockquote",
  ].includes(node.type);

  return isBlock ? `${text}\n` : text;
}

function isCommunityDocument(value: unknown): value is CommunityDocument {
  if (!value || typeof value !== "object") return false;
  const candidate = value as { type?: unknown; content?: unknown };

  return candidate.type === "doc" && Array.isArray(candidate.content);
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
  return blocks;
}
