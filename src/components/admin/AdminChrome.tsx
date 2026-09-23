import Image from "next/image";
import Link from "next/link";

export function AdminBrand() {
  return (
    <Link
      href="/"
      aria-label="กลับหน้าหลัก MSU e-Training"
      className="flex items-center gap-3 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8ad1c5]"
    >
      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm">
        <Image
          src="/logo_etraining.png"
          alt="MSU e-Training"
          width={40}
          height={40}
          className="h-full w-full object-cover"
        />
      </div>
      <div>
        <p className="text-[0.67rem] font-bold uppercase tracking-[0.2em] text-[#8ad1c5]">
          MSU
        </p>
        <p className="text-sm font-semibold text-white">e-Training</p>
      </div>
    </Link>
  );
}

export function AdminProfile({
  displayName,
  isOrgAdmin,
}: {
  displayName: string;
  isOrgAdmin: boolean;
}) {
  const initial = displayName.trim().charAt(0).toUpperCase() || "A";

  return (
    <div className="flex min-w-0 items-center gap-2">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0f766e] text-xs font-bold text-white shadow-sm">
        {initial}
      </div>
      <div className="hidden min-w-0 text-left sm:block">
        <p className="max-w-32 truncate text-xs font-bold text-slate-800">
          {displayName}
        </p>
        <p className="text-[0.68rem] text-slate-400">
          {isOrgAdmin ? "Organization Admin" : "Administrator"}
        </p>
      </div>
    </div>
  );
}
