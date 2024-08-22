import React from "react";

const FilePreview = ({ file, onRemove }) => {
  return (
    <div className="file-preview">
      <div
        className="dropZone__img"
        style={{ backgroundImage: `url(${file.preview})` }}
      ></div>
    </div>
  );
};

export default FilePreview;
