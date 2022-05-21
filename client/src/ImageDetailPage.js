import React from "react";
import { useParams } from "react-router-dom";
import uniqueId from "lodash/uniqueId";
import "./ImageDetailPage.css";
import { FaTimesCircle } from "react-icons/fa";

const ImageDetailPage = ({ token }) => {
  const { imageName } = useParams();
  const [imageb64, setImageb64] = React.useState("");
  const [image, setImage] = React.useState(new Image());
  const [error, setError] = React.useState("");
  const [editMode, setEditMode] = React.useState(false);

  const [mouseXStart, setMouseXStart] = React.useState(null);
  const [mouseYStart, setMouseYStart] = React.useState(null);
  const [annotations, setAnnotations] = React.useState([]);
  const [annotationsInEditMode, setAnnotationsinEditMode] = React.useState([]);

  React.useEffect(() => {
    fetch(`http://localhost:8000/images/${imageName}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((response) => {
      if (response.ok) {
        response.json().then((r) => {
          setImageb64(r.imageb64);
          // key: uniqueId("annotation-"),
          setAnnotations(
            r.annotations.map((item) => {
              return { key: uniqueId("annotation-"), ...item };
            })
          );
          setError("");
          var i = new Image();
          i.src = r.imageb64;
          setImage(i);
        });
      } else {
        response.json().then((r) => {
          setImageb64("");
          setError(r.detail);
        });
      }
    });
  }, []);
  React.useEffect(() => {
    const canvas = document.getElementById("image-canvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (editMode) {
      drawAnnotations(annotationsInEditMode);
    } else {
      drawAnnotations(annotations);
    }
  }, [annotations, annotationsInEditMode]);

  const handleMouseDown = (event) => {
    const boundary = event.target.getBoundingClientRect();
    setMouseXStart(Math.round(event.clientX - boundary.left));
    setMouseYStart(Math.round(event.clientY - boundary.top));
  };

  const handleMouseMove = (event) => {
    if (event.buttons === 1 && mouseXStart) {
      const boundary = event.target.getBoundingClientRect();

      const xCurrent = event.clientX - boundary.left;
      const yCurrent = event.clientY - boundary.top;

      var ctx = event.target.getContext("2d");

      ctx.clearRect(0, 0, event.target.width, event.target.height);

      ctx.beginPath();
      ctx.fillStyle = "rgba(170,210,230,0.5)";
      ctx.fillRect(
        mouseXStart,
        mouseYStart,
        xCurrent - mouseXStart,
        yCurrent - mouseYStart
      );
      ctx.stroke();
      drawAnnotations(annotationsInEditMode);
    }
  };

  const handleMouseUp = (event) => {
    var ctx = event.target.getContext("2d");

    ctx.clearRect(0, 0, event.target.width, event.target.height);
    const boundary = event.target.getBoundingClientRect();
    const newAnnotations = [
      ...annotationsInEditMode,
      {
        key: uniqueId("annotation-"),
        caption: "",
        x1: mouseXStart,
        y1: mouseYStart,
        x2: Math.round(event.clientX - boundary.left),
        y2: Math.round(event.clientY - boundary.top),
      },
    ];
    drawAnnotations(newAnnotations);
    setMouseXStart(null);
    setMouseYStart(null);
    setAnnotationsinEditMode(newAnnotations);
  };

  const drawAnnotations = (annotationsList) => {
    const canvas = document.getElementById("image-canvas");
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(0, 0, 255, 1)'
    for (const a of annotationsList) {
      ctx.beginPath();
      ctx.rect(
        Math.round(a.x1),
        Math.round(a.y1),
        Math.round(a.x2 - a.x1),
        Math.round(a.y2 - a.y1)
      );

      ctx.stroke();
    }
  };

  const handleCloseButtonClick = (key) => {
    const newA = annotationsInEditMode.filter((item) => item.key !== key);
    setAnnotationsinEditMode(newA);
  };

  const handleOptionChange = (key) => {
    setAnnotationsinEditMode(
      annotationsInEditMode.map((item) => {
        if (item.key === key) {
          item.caption = document.getElementById(key).value;
        }
        return item;
      })
    );
  };
  const AnnotationViewMarkers = () => {
    return annotations.map((item, index) => (
      <label
        key={item.key}
        style={{
          position: "absolute",
          color: 'white',
          backgroundColor: 'blue',
          left: `${item.x1 < item.x2 ? item.x1 : item.x2}px`,
          top: `${item.y1 < item.y2 ? item.y1 : item.y2 }px`,
        }}
      >
        {item.caption}
      </label>
    ));
  };
  const AnnotationEditMarkers = () => {
    return (
      <>
        {annotationsInEditMode.map((item) => (
          <select
            key={item.key}
            id={item.key}
            onChange={() => handleOptionChange(item.key)}
            value={item.caption}
            style={{
              position: "absolute",
              left: `${item.x1 < item.x2 ? item.x1 : item.x2}px`,
              top: `${item.y1 > item.y2 ? item.y1 + 5 : item.y2 + 5}px`,
            }}
          >
            <option value=""></option>
            <option value="Autorickshaw">Autorickshaw</option>
            <option value="Bike">Bike</option>
            <option value="Bus">Bus</option>
            <option value="Car">Car</option>
          </select>
        ))}
        {annotationsInEditMode.map((item) => (
          <FaTimesCircle
            onClick={() => handleCloseButtonClick(item.key)}
            style={{
              position: "absolute",
              left: `${item.x1 > item.x2 ? item.x1 - 8 : item.x2 - 8}px`,
              top: `${item.y1 < item.y2 ? item.y1 - 8 : item.y2 - 8}px`,
            }}
          />
        ))}
      </>
    );
  };
  const handleSaveAnnotations = () => {
    const payloadArr = annotationsInEditMode.map((item) => {
      return Object.keys(item)
        .filter((k) => k !== "key")
        .reduce((obj, k) => {
          obj[k] = item[k];
          return obj;
        }, {});
    });
    fetch(`http://localhost:8000/images/${imageName}/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ items: payloadArr }),
    }).then((response) => {
      if (response.ok) {
        setAnnotations(annotationsInEditMode);
        setAnnotationsinEditMode([]);
        setEditMode(false);
      }
      else {
        response.json().then(r => alert(r.detail))
      }
    });
  };

  const handleEditAnnotations = () => {
    setAnnotationsinEditMode(annotations);
    setEditMode(true);
  };

  const handleCancelAnnotations = () => {
    setAnnotationsinEditMode([]);
    setEditMode(false);
  };

  const handleResetAnnotations = () => {
    setAnnotationsinEditMode([]);
  };

  const handleDownload = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    for (let a of annotations) {
      let rowContent = [imageName, a.x1, a.y1, a.x2, a.y2]
        .join(",")
        .concat("\n");
      csvContent += rowContent;
    }
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "annotations_data.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div>
      {error ? (
        <h3>{error}</h3>
      ) : (
        <>
          <p>Image Name: {imageName}</p>
          <p>
            This image has {annotations.length}{" "}
            {annotations.length === 1 ? "annotation" : "annotations"}.
          </p>
          {editMode ? (
            <div className="action-panel">
              <button onClick={handleSaveAnnotations}>Save Annotations</button>
              <button onClick={handleCancelAnnotations}>Cancel</button>
              <button onClick={handleResetAnnotations}>Reset</button>
            </div>
          ) : (
            <div className="action-panel">
              <button onClick={handleEditAnnotations}>Edit Annotations</button>
              <button onClick={handleDownload}>Download as CSV</button>
            </div>
          )}
          <div className="annotation-div">
            <canvas
              id="image-canvas"
              style={{
                background: `url(${imageb64})`,
                backgroundSize: `${(image.width * 600) / image.height}px 600px`,
              }}
              width={`${(image.width * 600) / image.height}px`}
              height="600px"
              onMouseDown={editMode ? handleMouseDown : null}
              onMouseMove={editMode ? handleMouseMove : null}
              onMouseUp={editMode ? handleMouseUp : null}
              onMouseOver={(event) => {
                event.target.style.cursor = editMode ? "crosshair" : "default";
              }}
            >
              Your browser does not support the HTML canvas tag.
            </canvas>
            {editMode ? <AnnotationEditMarkers /> : <AnnotationViewMarkers />}
          </div>
        </>
      )}
    </div>
  );
};

export default ImageDetailPage;
