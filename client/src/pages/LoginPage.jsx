import { Card } from "react-bootstrap";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

function decodeJwtPayload(jwt) {
  const payload = jwt.split(".")[1];
  const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
  return JSON.parse(decodeURIComponent(escape(json)));
}

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();

  return (
    <Card className="mx-auto shadow-sm" style={{ maxWidth: 520 }}>
      <Card.Body>
        <h2 className="mb-2">PocketPulse</h2>
        <p className="text-muted mb-4">
          Sign in with Google to track your transactions.
        </p>

        <GoogleLogin
          onSuccess={(cred) => {
  const token = cred.credential;
  localStorage.setItem("pp_token", token);
  const payload = decodeJwtPayload(token);
  login({
    token,
    profile: {
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
    },
  });
  nav("/");
}}

          onError={() => alert("Google login failed")}
          useOneTap={false}
        />
      </Card.Body>
    </Card>
  );
}
