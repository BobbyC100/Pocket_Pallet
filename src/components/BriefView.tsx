"use client";
import ReactMarkdown from "react-markdown";

export default function BriefView({ md }: { md: string }) {
  return (
    <div className="prose prose-sm max-w-none">
      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
        <ReactMarkdown>{md || "_Empty_"}</ReactMarkdown>
      </div>
    </div>
  );
}

