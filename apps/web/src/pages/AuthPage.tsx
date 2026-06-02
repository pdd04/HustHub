import type { AuthUser } from "@itss/shared";
import { ArrowLeft, LogIn, UserPlus } from "lucide-react";
import { useState } from "react";
import { loginUser, registerUser } from "../lib/api";

type AuthPageProps = {
  mode: "login" | "register";
  onAuthenticated: (user: AuthUser, accessToken: string) => void;
  onBack: () => void;
  onSwitchMode: (mode: "login" | "register") => void;
};

export function AuthPage({ mode, onAuthenticated, onBack, onSwitchMode }: AuthPageProps) {
  const [fullName, setFullName] = useState("");
  const [studentCode, setStudentCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isRegister = mode === "register";

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = isRegister
        ? await registerUser({
            fullName,
            email,
            password,
            studentCode
          })
        : await loginUser({
            email,
            password
          });

      onAuthenticated(result.user, result.accessToken);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Không thể xác thực tài khoản.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="detail-header">
        <div className="detail-header__inner">
          <button className="ghost-button" type="button" onClick={onBack}>
            <ArrowLeft size={16} /> Quay lại
          </button>
          <button className="ghost-button" type="button" onClick={() => onSwitchMode(isRegister ? "login" : "register")}>
            {isRegister ? <LogIn size={16} /> : <UserPlus size={16} />}
            {isRegister ? "Đăng nhập" : "Đăng ký"}
          </button>
        </div>
      </header>

      <main className="auth-layout">
        <section className="auth-panel">
          <p className="eyebrow">Tài khoản sinh viên</p>
          <h1>{isRegister ? "Đăng ký" : "Đăng nhập"}</h1>
          <form className="form-stack" onSubmit={submit}>
            {isRegister ? (
              <>
                <label className="field">
                  <span>Họ tên</span>
                  <input value={fullName} onChange={(event) => setFullName(event.target.value)} required minLength={2} />
                </label>
                <label className="field">
                  <span>Mã sinh viên</span>
                  <input value={studentCode} onChange={(event) => setStudentCode(event.target.value)} />
                </label>
              </>
            ) : null}

            <label className="field">
              <span>Email</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>
            <label className="field">
              <span>Mật khẩu</span>
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} />
            </label>

            {errorMessage ? <div className="form-error">{errorMessage}</div> : null}

            <button className="primary-button" type="submit" disabled={isSubmitting}>
              {isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}
              {isSubmitting ? "Đang xử lý..." : isRegister ? "Tạo tài khoản" : "Đăng nhập"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
