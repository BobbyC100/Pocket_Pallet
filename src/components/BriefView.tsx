"use client";
import ReactMarkdown from "react-markdown";

export default function BriefView({ md }: { md: string }) {
  return (
    <div className="prose prose-sm max-w-none prose-invert">
      <div className="whitespace-pre-wrap text-banyan-text-default leading-relaxed">
        <ReactMarkdown>{md || "_Empty_"}</ReactMarkdown>
      </div>
    </div>
  );
}

