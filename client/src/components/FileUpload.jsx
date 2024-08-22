import React, { useState } from "react";
import "./FileUpload.css";
import socket from "../utils/socketConnection";

function FileUpload() {
  const [filesProgress, setFilesProgress] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    const progressArray = files.map((file) => ({
      file,
      progress: 0,
      completed: false,
    }));

    setFilesProgress(progressArray);
    setUploading(true);

    const uploadFile = (index) => {
      if (index >= files.length) {
        setUploading(false);
        return;
      }

      const file = files[index];
      const formData = new FormData();
      formData.append("files", file);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "http://localhost:5000/upload", true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = ((event.loaded / event.total) * 100).toFixed(
            2
          );
          setFilesProgress((prevProgress) =>
            prevProgress.map((item, i) =>
              i === index ? { ...item, progress: percentComplete } : item
            )
          );
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          setFilesProgress((prevProgress) =>
            prevProgress.map((item, i) =>
              i === index ? { ...item, completed: true } : item
            )
          );
          uploadFile(index + 1); // Proceed to next file
        } else {
          setUploading(false);
          alert("File upload failed");
        }
      };

      xhr.onerror = () => {
        setUploading(false);
        alert("File upload failed");
      };

      xhr.send(formData);
    };

    uploadFile(0); // Start uploading the first file
  };

  return (
    <div>
      <h1>Upload Files Sequentially with Progress:</h1>
      <input type="file" multiple onChange={handleFileChange} />
      <div className="progress-container">
        {filesProgress.map((file, index) => (
          <div key={index} className="progress-file">
            <div className="progress-label">
              {file.file.name}: {file.progress}%
            </div>
            <div className="progress-bar">
              <div
                className={`progress-bar-fill ${
                  file.completed ? "completed" : ""
                }`}
                style={{ width: `${file.progress}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FileUpload;
