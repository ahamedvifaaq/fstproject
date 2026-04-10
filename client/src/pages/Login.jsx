import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth";
import "./Login.css";

export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {

    e.preventDefault();

    try {

      const res = await loginUser({
        email,
        password
      });

      localStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("userId", res.data.id);
      

      navigate("/courses");

    } catch (err) {

      alert(err.response?.data?.message || "Login failed");

    }

  };

  return (
    <div className='container'>
    <div className="auth-container">
      <div className="auth-box login-box">

        <div className="auth-header">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="auth-form">

          <div className="form-group">
            <label className="form-label">Email</label>

            <input
              type="email" className="form-input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

          </div>

          <div className="form-group">

            <label className="form-label">Password</label>

            <div className="password-input-group">

              <input
                type={showPassword ? "text" : "password"}
                className="form-input" placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁" : "👁‍🗨"}
              </button>

            </div>

          </div>

          <button type="submit" className="btn btn-primary">
            Sign In
          </button>

        </form>

        <div className="divider">
          <span>or</span>
        </div>

        <button
          className="btn btn-google"
          onClick={() =>
            (window.location.href =
              "http://localhost:5000/api/auth/google")
          }
        >
          Sign in with Google
        </button>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>

      </div>
    </div>
    </div>
  );
}