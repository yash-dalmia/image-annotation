import React from "react";
import "./UploadPage.css";
import uniqueId from "lodash/uniqueId";
import { FaFileUpload, FaRegTrashAlt } from "react-icons/fa";

const sendAlert = (success, failure) => {
  let message = "";
  if (success.length > 0) {
    message += "Successfully uploaded:";
    success.map((item) => {
      message += `\n${item}`;
      return message;
    });
    message += "\n\n";
  }
  if (failure.length > 0) {
    message += "Upload failed for:";
    failure.map((item) => {
      message += `\n${item}`;
      return message;
    });
  }
  alert(message);
};
const UploadPage = ({ token }) => {
  const [selectedFiles, setSelectedFiles] = React.useState({});

  const onSelectFile = (e) => {
    let alertFiles = [];
    let allSelectedFiles = selectedFiles;

    for (let item of Object.values(e.target.files)) {
      if (
        Object.values(selectedFiles)
          .map((s) => s.name)
          .includes(item.name)
      ) {
        alertFiles.push(item.name);
      } else {
        let newId = uniqueId("image-");
        let itemObj = {};
        itemObj[newId] = item;
        allSelectedFiles = { ...allSelectedFiles, ...itemObj };
      }
    }
    setSelectedFiles(allSelectedFiles);

    if (alertFiles.length > 0) {
      let message =
        alertFiles.length === 1
          ? "Following file was ignored as it is already added:"
          : "Following files were ignored as they are already added:";
      for (let f of alertFiles) {
        message += `\n${f}`;
      }
      alert(message);
    }
  };

  const handleRemoveImage = (image) => {
    let keyToRemove = "";
    for (let k of Object.keys(selectedFiles)) {
      if (selectedFiles[k] === image) keyToRemove = k;
    }

    const newFiles = Object.keys(selectedFiles)
      .filter((k) => k !== keyToRemove)
      .reduce((obj, k) => {
        obj[k] = selectedFiles[k];
        return obj;
      }, {});
    setSelectedFiles(newFiles);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    let imageb64s = [];

    for (let s of Object.values(selectedFiles)) {
      let reader = new FileReader();
      reader.readAsDataURL(s);
      reader.onload = () => {
        imageb64s.push(reader.result);

        if (imageb64s.length === Object.values(selectedFiles).length) {
          fetch("http://localhost:8000/upload", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              items: Object.values(selectedFiles).map((item, index) => {
                return {
                  imageName: item.name,
                  imageb64: imageb64s[index],
                };
              }),
            }),
          })
            .then((response) => response.json())
            .then((r) => {
              setSelectedFiles([])
              sendAlert(r.success, r.failure);
            });
        }
      };
      reader.onerror = (error) => {
        console.log("Error: ", error);
      };
    }
  };

  const Preview = ({ image }) => {
    return (
      <div className="preview-thumbnail">
        <img src={URL.createObjectURL(image)} alt={image.name} height="200px" />

        <div className="name-tooltip">
          <label className="preview-label">{image.name}</label>
          <span className="tooltip-text">{image.name}</span>
        </div>

        <div className="action-tooltip">
          <FaRegTrashAlt
            className="remove-icon"
            onClick={() => handleRemoveImage(image)}
          />
          <span className="tooltip-text">Click to remove</span>
        </div>
      </div>
    );
  };

  const PreviewPanel = () => {
    return (
      <>
        <div className="upload-panel">
          <form className="image-upload-form" onSubmit={handleSubmit}>
            <div className="image-upload-div">
              <input
                id="fileInput"
                type="file"
                onChange={onSelectFile}
                accept="image/*"
                multiple
              />
              <div className="upload-captions">
                <FaFileUpload className="upload-icon" />
                <label>Drag files here or click in this area.</label>
              </div>
            </div>
            <button type="submit">Submit</button>
          </form>
        </div>

        <div className="preview-panel">
          <div className="preview-header-panel">
            {Object.values(selectedFiles).length > 0 ? (
              <h3>
                Preview of selected images is shown below. Click on Submit to
                upload to server.
              </h3>
            ) : null}
          </div>
          <div className="preview-thumbnail-panel">
            {Object.values(selectedFiles).map((item) => (
              <Preview key={uniqueId("preview-")} image={item} />
            ))}
          </div>
        </div>
      </>
    );
  };

  return <PreviewPanel />;
};

export default UploadPage;
