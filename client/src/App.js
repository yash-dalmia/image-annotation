import React from "react";
import LoginPage from "./LoginPage";
import RegisterPage from "./RegisterPage";
import ImagesPage from "./ImagesPage";
import ImageDetailPage from "./ImageDetailPage";
import UploadPage from "./UploadPage";
import "./App.css";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import NavComponent from "./NavComponent";

const NotAuthenticatedPage = () => {
  const navigate = useNavigate();
  return (
    <div>
      <h3>
        You are not authenticated to view this page. Please{" "}
        <label
          className="link"
          onClick={() => {
            navigate("/login");
          }}
        >
          login
        </label>
        .
      </h3>
    </div>
  );
};

const PageNotFound = () => {
  const navigate = useNavigate();
  return (
    <div>
      <h3>
        You have reached an invalid page. Go back to{" "}
        <label
          className="link"
          onClick={() => {
            navigate("/");
          }}
        >
          Home
        </label>
        .
      </h3>
    </div>
  );
};

const App = () => {
  const [user, setUser] = React.useState("");
  const [token, setToken] = React.useState("");
  const [authenticated, setAuthenticated] = React.useState(false);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            authenticated ? (
              <Navigate to="/images" />
            ) : (
              <Navigate to="/register" />
            )
          }
        />
        <Route
          path="/login"
          element={
            <LoginPage
              setToken={setToken}
              setUser={setUser}
              setAuthenticated={setAuthenticated}
            />
          }
        />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/images"
          element={
            authenticated ? (
              <>
                <NavComponent
                  user={user}
                  setUser={setUser}
                  setToken={setToken}
                  setAuthenticated={setAuthenticated}
                />
                <ImagesPage token={token} />
              </>
            ) : (
              <NotAuthenticatedPage />
            )
          }
        />
        <Route
          path="/images/:imageName"
          element={
            authenticated ? (
              <>
                <NavComponent
                  user={user}
                  setUser={setUser}
                  setToken={setToken}
                  setAuthenticated={setAuthenticated}
                />
                <ImageDetailPage token={token} />
              </>
            ) : (
              <NotAuthenticatedPage />
            )
          }
        />
        <Route
          path="/upload"
          element={
            authenticated ? (
              <>
                <NavComponent
                  user={user}
                  setUser={setUser}
                  setToken={setToken}
                  setAuthenticated={setAuthenticated}
                />
                <UploadPage token={token} />
              </>
            ) : (
              <NotAuthenticatedPage />
            )
          }
        />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
