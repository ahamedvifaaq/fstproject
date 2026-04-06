import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function GoogleCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const role = searchParams.get("role");

    if (token) {
      localStorage.setItem("accessToken", token);
      localStorage.setItem("role", role || "student");
      navigate("/courses", { replace: true });
    } else {
      // No token found – redirect to login
      navigate("/login", { replace: true });
    }
  }, [searchParams, navigate]);

  return <p style={{ textAlign: "center", marginTop: "2rem" }}>Signing you in...</p>;
}
