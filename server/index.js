const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const express = require("express");
const http = require("http");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const app = express();

const server = http.createServer(app);
app.use(cors({ origin: "*" }));
const io = require("socket.io")(server, {
  allowEIO3: true,
  cors: {
    origin: "*",
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  },
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});
let fileStatus = {};
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = "uploads/";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    console.log("filename", file);
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

app.post("/upload", (req, res) => {
  let totalBytes = parseInt(req.headers["content-length"]); // Total size of all files
  let uploadedBytes = 0;
  console.log("uploaded", totalBytes);
  req.on("data", (chunk) => {
    uploadedBytes += chunk.length;
    const progress = ((uploadedBytes / totalBytes) * 100).toFixed(2);
    console.log(`Uploaded: ${progress}%`);
    res.write(`Uploaded: ${progress}%\n`);
  });
  console.log(`Uploaded: ${uploadedBytes}%`);
  upload.array("files", 10)(req, res, (err) => {
    if (err) {
      return res.status(500).send("File upload failed.");
    }
    res.end("Files uploaded successfully.");
  });
});

function convertToMp4(filename) {
  const inputFilePath = path.join(__dirname, "uploads", filename);
  const outputFilePath = path.join(
    __dirname,
    "uploads",
    `${path.parse(filename).name}.mp4`
  );

  ffmpeg(inputFilePath)
    .output(outputFilePath)
    .on("end", () => {
      fileStatus[filename] = "completed";
      io.emit("file-status", { filename, status: "completed" });
    })
    .on("error", (err) => {
      fileStatus[filename] = "error";
      io.emit("file-status", { filename, status: "error" });
    })
    .run();
}
server.listen(5000, () => {
  console.log("Server running on port 5000");
});
