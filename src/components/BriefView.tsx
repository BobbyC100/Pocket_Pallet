"use client";
import ReactMarkdown from "react-markdown";

export default function BriefView({ md }: { md: string }) {
  return (
    <article className="prose prose-invert max-w-none">
      <ReactMarkdown>{md || "_Empty_"}</ReactMarkdown>
    </article>
  );
}

