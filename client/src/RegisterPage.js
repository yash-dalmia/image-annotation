import React from "react";
import "./LoginPage.css";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const [status, setStatus] = React.useState("");
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    console.log(event);
    event.preventDefault();
    fetch("http://localhost:8000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: event.target.elements.usernameInput.value,
        password: event.target.elements.passwordInput.value,
        project: event.target.elements.projectInput.value,
      }),
    }).then((response) => {
      if (response.ok) {
        alert("Successfully registered!");
        navigate("/login");
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
          <div>
            <label htmlFor="projectInput">Project name</label>
            <br />
            <input id="projectInput" type="text" />
          </div>
          <div className="status-msg">{status ? status : ""}</div>
          <br />
          <button>Register</button>
        </form>
        <br />
        <div>
          <span>
            Already have an account?{" "}
            <label className="link"
              onClick={() => {
                navigate("/login");
              }}
            >
              Login
            </label>
          </span>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
