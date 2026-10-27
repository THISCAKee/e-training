"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight, ChartColumn, Check,
  ChevronDown, LayoutDashboard, LogOut, Menu, X, LibraryBig, LogIn,
} from "lucide-react";
import GeneratedAvatar from "./GeneratedAvatar";
import styles from "./Header.module.css";

const navigation = [
  { href: "/courses", label: "หลักสูตรทั้งหมด", icon: LibraryBig },
  { href: "/stats", label: "ข้อมูลและสถิติ", icon: ChartColumn },
];

export default function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [panel, setPanel] = useState<{
    name: "mobile" | "profile";
    pathname: string;
  } | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);
  const openPanel = panel?.pathname === pathname ? panel.name : null;
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "ORG_ADMIN";
  const avatarSeed = session?.user?.id || session?.user?.email || session?.user?.name || "member";
  const displayName = session?.user?.name || "บัญชีของฉัน";

  function togglePanel(name: "mobile" | "profile") {
    setPanel(openPanel === name ? null : { name, pathname });
  }

  useEffect(() => {
    if (!openPanel) return;
    function handlePointerDown(event: PointerEvent) {
      const container = openPanel === "profile" ? profileRef.current : headerRef.current;
      if (container && !container.contains(event.target as Node)) setPanel(null);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setPanel(null);
      (openPanel === "profile" ? profileButtonRef : mobileButtonRef).current?.focus();
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openPanel]);

  if (pathname.startsWith("/admin")) return null;

  return (
    <header ref={headerRef} className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} onClick={() => setPanel(null)} aria-label="MSU Smartlearning หน้าหลัก">
          <Image src="/logo_etraining.png" alt="" width={80} height={49} className={styles.logo} />
          <span className={styles.brandText}>
            <strong>MSU SMARTLEARNING</strong>
            <span>สำนักวิทยบริการ มหาวิทยาลัยมหาสารคาม</span>
          </span>
        </Link>

        <nav
          id="header-navigation"
          aria-label="เมนูหลัก"
          className={`${styles.navigation} ${openPanel === "mobile" ? styles.navigationOpen : ""}`}
        >
          {navigation.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link key={href} href={href} aria-current={active ? "page" : undefined} onClick={() => setPanel(null)} className={styles.navLink}>
                <Icon size={17} strokeWidth={1.7} aria-hidden="true" />
                {label}
                <span className={styles.activeDot} aria-hidden="true" />
              </Link>
            );
          })}
        </nav>

        <div className={styles.actions}>
          {status === "loading" ? (
            <div role="status" className={styles.skeleton}>
              <span className="sr-only">กำลังโหลดข้อมูลผู้ใช้</span>
            </div>
          ) : session ? (
            <div
              ref={profileRef}
              className={styles.profile}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) setPanel(null);
              }}
            >
              <button
                ref={profileButtonRef}
                type="button"
                className={styles.profileButton}
                aria-label={`เมนูบัญชีผู้ใช้ ${displayName}`}
                aria-expanded={openPanel === "profile"}
                aria-controls="header-account-panel"
                onClick={() => togglePanel("profile")}
              >
                <span key={avatarSeed} className={styles.avatarEntrance}>
                  <span className={styles.avatarShell}>
                    <GeneratedAvatar seed={avatarSeed} />
                    <span className={styles.onlineBadge}><Check size={9} strokeWidth={3} /></span>
                  </span>
                </span>
                <span className={styles.identity}>
                  <span className={styles.greeting}>สวัสดี,</span>
                  <strong>{displayName}</strong>
                </span>
                <ChevronDown className={styles.chevron} size={15} aria-hidden="true" />
              </button>

              {openPanel === "profile" && (
                <div id="header-account-panel" className={styles.dropdown}>
                  <div className={styles.accountCard}>
                    <span className={styles.cardAvatar}><GeneratedAvatar seed={avatarSeed} /></span>
                    <div className={styles.accountIdentity}>
                      <strong>{displayName}</strong>
                      <span>{session.user?.email}</span>
                      <span className={styles.accountStatus}><span /> เข้าสู่ระบบแล้ว</span>
                    </div>
                  </div>
                  <div className={styles.dropdownLinks}>
                    <Link href={isAdmin ? "/admin" : "/dashboard"} onClick={() => setPanel(null)} className={styles.dropdownLink}>
                      <span className={styles.menuIcon}><LayoutDashboard size={18} /></span>
                      <span>{isAdmin ? "Dashboard" : "หลักสูตรที่ลงเรียน"}</span>
                      <ArrowUpRight size={15} className={styles.menuArrow} />
                    </Link>
                    <button type="button" className={`${styles.dropdownLink} ${styles.signOut}`} onClick={() => {
                      setPanel(null);
                      void signOut({ callbackUrl: "/" });
                    }}>
                      <span className={styles.menuIcon}><LogOut size={18} /></span>
                      <span>ออกจากระบบ</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" onClick={() => setPanel(null)} className={styles.loginButton}>
              เข้าสู่ระบบ <LogIn size={17} aria-hidden="true" />
            </Link>
          )}
          <button
            ref={mobileButtonRef}
            type="button"
            className={styles.mobileButton}
            aria-label={openPanel === "mobile" ? "ปิดเมนูหลัก" : "เปิดเมนูหลัก"}
            aria-expanded={openPanel === "mobile"}
            aria-controls="header-navigation"
            onClick={() => togglePanel("mobile")}
          >
            {openPanel === "mobile" ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>
    </header>
  );
}
