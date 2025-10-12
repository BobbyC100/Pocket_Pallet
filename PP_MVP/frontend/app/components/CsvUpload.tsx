"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

type UploadState = "idle" | "uploading" | "success" | "error";

const MAX_BYTES = 50 * 1024 * 1024; // 50MB
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function CsvUpload() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string>("");

  function pickFile() {
    inputRef.current?.click();
  }

  function validate(f: File): string | null {
    if (!f) return "No file selected.";
    if (f.size > MAX_BYTES) return "File exceeds 50MB limit.";
    const valid = f.name.endsWith(".csv") || f.type.includes("csv");
    return valid ? null : "Only .csv files are allowed.";
  }

  function onFileChosen(f: File | null) {
    if (!f) return;
    const err = validate(f);
    if (err) {
      setMessage(err);
      setFile(null);
      return;
    }
    setMessage("");
    setFile(f);
  }

  async function upload() {
    if (!file) return;
    setState("uploading");
    setProgress(0);
    setMessage("");

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await axios.post(`${API_URL}/api/v1/imports/csv`, form, {
        onUploadProgress: (e) => {
          if (!e.total) return;
          setProgress(Math.round((e.loaded / e.total) * 100));
        },
      });

      if (res.status >= 200 && res.status < 300) {
        setState("success");
        setMessage(`Imported ${res.data?.rows ?? "N"} wines successfully.`);
        setTimeout(() => router.push("/dashboard"), 1500);
      } else {
        throw new Error(res.statusText);
      }
    } catch (err: any) {
      setState("error");
      const detail = err?.response?.data?.detail || err?.message || "Upload failed.";
      setMessage(detail);
    }
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    onFileChosen(f ?? null);
  }

  return (
    <div className="space-y-4">
      <div
        onClick={pickFile}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
          dragOver 
            ? "border-wine-400 bg-wine-50" 
            : "border-gray-300 hover:border-wine-300"
        }`}
      >
        <div className="flex flex-col items-center gap-2">
          <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="font-medium text-gray-700">Drag & drop your CSV here</p>
          <p className="text-sm text-gray-500">or click to choose a file (max 50MB)</p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => onFileChosen(e.target.files?.[0] ?? null)}
        />
      </div>

      {file && (
        <div className="rounded-lg border border-gray-200 p-4 bg-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-wine-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium">{file.name}</span>
              <span className="text-xs text-gray-500">
                ({(file.size / 1024 / 1024).toFixed(1)} MB)
              </span>
            </div>
            <button 
              onClick={() => setFile(null)} 
              className="text-sm text-wine-600 hover:text-wine-700 font-medium"
            >
              Remove
            </button>
          </div>

          {state === "uploading" && (
            <div className="mt-3">
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-2 bg-wine-600 transition-all duration-300" 
                  style={{ width: `${progress}%` }} 
                />
              </div>
              <p className="text-xs text-right text-gray-600 mt-1">{progress}%</p>
            </div>
          )}
        </div>
      )}

      <button
        disabled={!file || state === "uploading"}
        onClick={upload}
        className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
          !file || state === "uploading"
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-wine-600 text-white hover:bg-wine-700"
        }`}
      >
        {state === "uploading" ? "Uploading..." : "Upload CSV"}
      </button>

      {message && (
        <div 
          className={`p-4 rounded-lg text-sm ${
            state === "error" 
              ? "bg-red-50 text-red-700 border border-red-200" 
              : "bg-green-50 text-green-700 border border-green-200"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}

