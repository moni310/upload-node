import axios from "axios";
// import { io } from "socket.io-client";

// Configure socket
// const socket = io("http://localhost:5000");

export const uploadFilesToServer = (filesArray, setFilesArray) => {
  console.log("Uploading files", filesArray);
  filesArray.forEach((file) => {
    const formData = new FormData();
    formData.append("file", file);
    const headers = {
      Accept: "application/json",
      "Content-Type": "multipart/form-data",
    };

    const fileUrl = `http://localhost:5000/upload?size=${file.size}&fileId=${file.name}-${file.lastModified}&mimetype=${file.type}&name=${file.name}`;

    axios
      .post(fileUrl, formData, { headers })
      .then((response) => {
        console.log(response);
        // socket.on("progress", (progressResponse) => {
        //   let updatedFilesArray = [...filesArray];
        //   updatedFilesArray.forEach((item, index) => {
        //     if (item.name === progressResponse.name) {
        //       item.percentage = progressResponse.percentage;
        //     }
        //     if (item.percentage === 100) {
        //       updatedFilesArray.splice(index, 1);
        //     }
        //   });
        //   setFilesArray(updatedFilesArray);
        // });
      })
      .catch((error) => {
        console.error("Error uploading file:", error);
      });
  });
};
