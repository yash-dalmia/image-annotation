import React from "react";
import "./ImagesPage.css";
import uniqueId from "lodash/uniqueId";
import { useNavigate } from "react-router-dom";

const Image = ({ imageName, imageb64 }) => {
  const navigate = useNavigate();
  return (
    <div onClick={() => navigate(`/images/${imageName}`)}>
      <img
        src={imageb64}
        alt={imageName}
        height="200px"
        // onClick={() => navigate(`/images/${imageName}`)}
      />
      <div className="image-label">
        <label>{imageName}</label>
      </div>
    </div>
  );
};

const ImagesPage = ({ token }) => {
  const [imageNames, setImageNames] = React.useState([]);
  const [imageb64s, setImageb64s] = React.useState([]);
  const [error, setError] = React.useState();
  const [annotations, setAnnotations] = React.useState(false);
  const [showAnnotatedOnly, setShowAnnotatedOnly] = React.useState(false);
  const navigate = useNavigate();

  const handleAnnotatedCheckbox = (event) => {
    setShowAnnotatedOnly(event.target.checked);
  };

  React.useEffect(() => {
    fetch("http://localhost:8000/images", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((response) => {
      if (response.ok) {
        response.json().then((r) => {
          setImageNames(r.map((item) => item.name));
          setImageb64s(r.map((item) => item.b64Data));
          setAnnotations(r.map((item) => item.annotations));
        });
      } else {
        response.json().then((r) => setError(r.detail));
      }
    });
  }, []);

  return (
    <>
      {error ? (
        <h3>
          {error}. Go to{" "}
          <span
            className="link"
            onClick={() => {
              navigate("/login");
            }}
          >
            Login
          </span>
          .
        </h3>
      ) : (
        <div>
          <h3>Click on image to open its annotations.</h3>

          <input
            type="checkbox"
            id="annotated"
            onChange={(e) => handleAnnotatedCheckbox(e)}
          />
          <label htmlFor="annotated">Annotated Only</label>
          <div className="images-panel">
            {imageNames
              .filter((item, index) => {
                return (
                  !showAnnotatedOnly ||
                  (showAnnotatedOnly && annotations[index] > 0)
                );
              })
              .map((i, index) => (
                <Image
                  key={uniqueId("image-")}
                  imageName={i}
                  imageb64={
                    imageb64s.filter((item, index) => {
                      return (
                        !showAnnotatedOnly ||
                        (showAnnotatedOnly && annotations[index] > 0)
                      );
                    })[index]
                  }
                />
              ))}
          </div>
        </div>
      )}
    </>
  );
};

export default ImagesPage;
