import { Mail } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import styles from "@/app/(auth)/login/login.module.css";

export default function LoginBrand() {
  return (
    <aside className={styles.brand} aria-labelledby="login-guide-title">
      <div className={styles.brandName}>
        <span>MSU <span className={styles.brandAccent}>AI</span>-Training</span>
      </div>
      <div className={styles.brandGuide}>
        <div className={styles.brandCopy}>
          <h2 id="login-guide-title">วิธีเข้าสู่ระบบเพื่อใช้งาน<span></span></h2>
        </div>
        <div className={styles.loginMethods}>
          <h3>วิธีเข้าสู่ระบบ</h3>
          <ul className={styles.methodList}>
            <li>
              <span className={`${styles.methodIcon} ${styles.googleIcon}`} aria-hidden="true">
                <FcGoogle size={24} />
              </span>
              <p>
                ใช้บัญชี Google <strong>@msu.ac.th</strong>
                <span>สำหรับนิสิตและบุคลากร มหาวิทยาลัยมหาสารคาม</span>
              </p>
            </li>
            <li>
              <span className={styles.methodIcon} aria-hidden="true">
                <Mail size={23} strokeWidth={1.7} />
              </span>
              <p>
                <strong>สำหรับบุคคลภายนอก</strong>
                <span>เข้าสู่ระบบด้วยอีเมลที่ลงทะเบียนไว้</span>
              </p>
            </li>
          </ul>
        </div>
      </div>
      <p className={styles.university}>MAHASARAKHAM UNIVERSITY</p>
    </aside>
  );
}
