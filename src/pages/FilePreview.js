import React from "react";

const FilePreview = ({ file }) => {
  if (!file) return null;

  if (file.type === "document") {
    return (
      <div className="flex items-center bg-white p-2 rounded-lg shadow-md cursor-pointer hover:bg-gray-100 transition">
        <img src="/pdf-icon.png" alt="PDF" className="w-6 h-6 mr-2" />
        <div className="flex flex-col">
          <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 font-semibold text-sm">
            {file.name || "Open PDF"}
          </a>
          <button
            className="text-gray-500 text-xs mt-1"
            onClick={() => window.open(file.url, "_blank")}
          >
            Download
          </button>
        </div>
      </div>
    );
  }

  if (file.type === "audio") {
    return (
      <div className="flex items-center bg-white p-2 rounded-lg shadow-md">
        <audio controls className="w-full">
          <source src={file.url} type="audio/mpeg" />
          Your browser does not support the audio tag.
        </audio>
        <div className="text-sm text-gray-600 mt-1">{file.name || "Audio File"}</div>
      </div>
    );
  }

  if (file.type === "image") {
    return (
      <img
        src={file.url}
        alt={file.name}
        className="w-48 h-48 object-cover rounded-lg cursor-pointer hover:opacity-80 transition"
        onClick={() => window.open(file.url, "_blank")}
      />
    );
  }

  return null;
};

export default FilePreview;
