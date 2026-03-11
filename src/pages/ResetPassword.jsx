import { useEffect, useState } from "react";
import supabase from "../lib/supabase";
import "./reset.css";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const accessToken = searchParams.get("access_token");
  const errors = ["not found", "Password"];

  const validatePassword = (pwd) => {
    const invalidChars = /[<>|\\]/.test(pwd);
    const minLen = pwd.length >= 6;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasDigit = /\d/.test(pwd);

    if (invalidChars) {
      return "Password cannot include space characters.";
    }
    if (!minLen) {
      return "Password must be at least 6 characters long.";
    }
    if (!hasUpper) {
      return "Password must include at least one uppercase letter.";
    }
    if (!hasLower) {
      return "Password must include at least one lowercase letter.";
    }
    if (!hasDigit) {
      return "Password must include at least one digit.";
    }
    return "";
  };

  const validateEmail = async () => {
    const { data, error } = await supabase.from("profiles").select("email").eq("email", email);

    if (error) {
      return false;
    }

    const confirm = data.some((profile) => profile.email === email);
    if (!confirm) {
      setMessage("Email not found. Please check and try again.");
    } else {
      setMessage("Email found. You can proceed to reset your password.");
    }
    return confirm;
  }

  const handleReset = async () => {
    if (!email || !password || !confirmPassword) {
      setMessage("Please enter your email and both password fields.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setMessage(passwordError);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: confirmPassword,
    });

    if (error) {
      console.error("Error updating password:", error.message);
      setMessage(error.message);
    } else {
      setMessage("Password updated successfully!");
      setSuccess(true);
    }

    console.log("Password updated successfully!");
    setPassword("");
    setConfirmPassword("");
  };

  useEffect(() => {
    if (email) {
      validateEmail();
    }

    if (accessToken) {
      supabase.auth.setSession(accessToken)
        .then(({ error }) => {
          if (error) {
            setMessage("Invalid access token. Please try resetting your password again.");
          }
        })
    }
  }, [email]);

  return (
    <div className="reset-container">
      <h2>Reset Password</h2>

      {email && (
        <p className={errors.some((error) => message.includes(error)) ? "error" : "success"}>
          {message}
        </p>
      )}

      {success && <p className="success">{message}</p>}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        maxLength={40}
      />
      <input
        type="password"
        placeholder="New password"
        disabled={!email || message.includes("not found")}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        maxLength={30}
      />
      <input
        type="password"
        placeholder="Confirm password"
        disabled={!email || message.includes("not found")}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        maxLength={30}
      />

      <button onClick={handleReset}>Reset Password</button>

    </div>
  );
}