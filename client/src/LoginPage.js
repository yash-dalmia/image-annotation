import React from "react";
import "./LoginPage.css";
import { useNavigate } from "react-router-dom";

const LoginPage = ({ setToken, setUser, setAuthenticated }) => {
  const [status, setStatus] = React.useState("");
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    fetch("http://localhost:8000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: event.target.elements.usernameInput.value,
        password: event.target.elements.passwordInput.value,
      }),
    }).then((response) => {
      if (response.ok) {
        response.json().then((r) => {
          setUser(event.target.elements.usernameInput.value);
          setToken(r.token);
          setAuthenticated(true);
          navigate("/images");
        });
      } else {
        response.json().then((r) => setStatus(r.detail));
      }
    });
  };

  return (
    <>
      <div className="header">Image Annotation Framework</div>
      <div className="login-box">
        <form className="login-form" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="usernameInput">Username</label>
            <br />
            <input id="usernameInput" type="text" />
          </div>
          <div>
            <label htmlFor="passwordInput">Password</label>
            <br />
            <input id="passwordInput" type="password" />
          </div>
          <div className="status-msg">{status ? status : ""}</div>
          <br />
          <button>Login</button>
        </form>
        <br />
        <div>
          <span>
            Don't have an account?{" "}
            <label className="link"
              onClick={() => {
                navigate("/register");
              }}
            >
              Register
            </label>
          </span>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
