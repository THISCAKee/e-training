"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, LoaderCircle, LockKeyhole, UserRound, CircleAlert } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import LoginBrand from "@/components/auth/LoginBrand";
import styles from "./login.module.css";
import { getLoginDestination } from "@/lib/auth/login-destination";

const loginErrorMessages: Record<string, string> = {
  CredentialsSignin: "ชื่อผู้ใช้ อีเมล หรือรหัสผ่านไม่ถูกต้อง",
  MsuAccountOnly: "เข้าสู่ระบบด้วย Google ได้เฉพาะบัญชี @msu.ac.th",
  AdminUseUsername: "ผู้ดูแลระบบต้องเข้าสู่ระบบด้วย Username และรหัสผ่าน",
  Default: "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
};

function LoginForm() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { data: session } = useSession();
  const router = useRouter();

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  // Error จาก URL params (กรณี redirect มาจากหน้าอื่น)
  const errorCode = searchParams.get("error");
  const urlError = errorCode
    ? (loginErrorMessages[errorCode] ?? loginErrorMessages.Default)
    : null;

  // รวม error ทั้ง 2 แหล่ง
  const error = loginError || urlError;

  useEffect(() => {
    if (session?.user) {
      router.replace(
        getLoginDestination(
          session.user.role,
          callbackUrl,
          session.user.needsFaculty,
        ),
      );
    }
  }, [session, router, callbackUrl]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setLoginError(null);

    const result = await signIn("credentials", {
      identifier,
      password,
      redirect: false,
    });

    if (result?.error) {
      setLoginError("ชื่อผู้ใช้ อีเมล หรือรหัสผ่านไม่ถูกต้อง");
      setIsLoading(false);
    } else if (result?.ok) {
      const res = await fetch("/api/auth/session", { credentials: "include" });
      const newSession = await res.json();
      const destination = getLoginDestination(
        newSession?.user?.role,
        callbackUrl,
      );
      window.location.assign(destination);
    }
  };

  const handleMsuSignIn = () => {
    setIsLoading(true);
    // กลับมาที่ /login เพื่อให้ useEffect พาไปหน้าตาม role เหมือนการเข้าสู่ระบบด้วยรหัสผ่าน
    signIn("google", {
      callbackUrl: `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`,
    });
  };

  return (
    <section className={`login-page ${styles.page}`} aria-label="เข้าสู่ระบบ MSU AI-Training">
      <div className={styles.panel}>
        <LoginBrand />
        <div className={styles.formSide}>
          <div className={styles.formContent}>
            <Link href="/" className={styles.backLink}>
              <ArrowLeft size={17} aria-hidden="true" /> กลับหน้าหลัก
            </Link>
            <form className={styles.form} onSubmit={handleSubmit} aria-busy={isLoading}>
              {error && (
                <div id="login-error" className={styles.error} role="alert">
                  <CircleAlert size={19} aria-hidden="true" />
                  <span>{error}</span>
                </div>
              )}
              <div>
                <button type="button" onClick={handleMsuSignIn} disabled={isLoading} className={styles.google}>
                  <span className={styles.googleMark}><FcGoogle size={24} aria-hidden="true" /></span>
                  <span>เข้าสู่ระบบด้วยอีเมล @msu.ac.th</span>
                </button>
                <p className={styles.googleNote}>บัญชี @msu.ac.th สำหรับนิสิตและบุคลากร มหาวิทยาลัยมหาสารคาม</p>
              </div>
              <div className={styles.divider}><span>หรือเข้าสู่ระบบด้วยอีเมลที่ลงทะเบียนไว้</span></div>
              <div className={styles.field}>
                <label htmlFor="identifier">อีเมลที่ลงทะเบียนไว้</label>
                <div className={styles.inputWrap}>
                  <UserRound size={19} aria-hidden="true" />
                  <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    required
                    placeholder="กรอกอีเมลที่ลงทะเบียนไว้"
                    aria-describedby={error ? "login-error" : undefined}
                    aria-invalid={!!error}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                </div>
              </div>
              <div className={styles.field}>
                <label htmlFor="password">รหัสผ่าน</label>
                <div className={styles.inputWrap}>
                  <LockKeyhole size={19} aria-hidden="true" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="กรอกรหัสผ่าน"
                    aria-describedby={error ? "login-error" : undefined}
                    aria-invalid={!!error}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                    aria-pressed={showPassword}
                    aria-controls="password"
                    onClick={() => setShowPassword((visible) => !visible)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={isLoading} className={styles.submit}>
                <span>{isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}</span>
                {isLoading ? <LoaderCircle size={20} className={styles.spinner} aria-hidden="true" /> : null}
              </button>
              <p className={styles.register}>
                ยังไม่มีบัญชี? <Link href="/register">สมัครสมาชิก</Link>
              </p>
            </form>
            <p className={styles.supportContact}>
              <span>หากมีปัญหาการเข้าใช้งาน ติดต่อผู้ดูแลระบบ</span>
              <a href="mailto:khunanon.m@msu.ac.th">khunanon.m@msu.ac.th</a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={<div className="flex justify-center p-10">กำลังโหลด...</div>}
    >
      <LoginForm />
    </Suspense>
  );
}
