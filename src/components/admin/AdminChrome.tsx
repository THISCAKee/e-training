import Image from "next/image";
import Link from "next/link";
import GeneratedAvatar from "@/components/GeneratedAvatar";

export function AdminBrand() {
  return (
    <Link
      href="/"
      aria-label="กลับหน้าหลัก MSU AI-Training"
      className="flex items-center gap-3 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
    >
      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <Image
          src="/logo_etraining.png"
          alt="DASDBOARD"
          width={40}
          height={40}
          className="h-full w-full object-cover"
        />
      </div>
      <div>
        <p className="text-sm font-bold text-blue-700">
          DASDBOARD
        </p>
        <p className="text-sm font-semibold text-slate-900">SMARTLEARNING</p>
      </div>
    </Link>
  );
}

export function AdminProfile({
  displayName,
  isOrgAdmin,
  avatarUrl,
  avatarSeed,
}: {
  displayName: string;
  isOrgAdmin: boolean;
  avatarUrl?: string | null;
  avatarSeed?: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-full border border-slate-200 bg-white py-1.5 pl-3 pr-1.5 shadow-[0_4px_16px_rgba(0,48,73,0.06)] transition duration-200 hover:shadow-[0_7px_20px_rgba(0,48,73,0.1)]">
      <div className="hidden min-w-0 text-right sm:block">
        <p className="max-w-36 truncate text-xs font-bold text-slate-800">
          {displayName}
        </p>
        <p className="mt-0.5 text-[0.68rem] text-slate-400">
          {isOrgAdmin ? "Organization Admin" : "Administrator"}
        </p>
      </div>
      <div
        className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-blue-50 ring-1 ring-blue-900/10 ring-offset-2 ring-offset-white/80 transition-transform duration-200 hover:scale-[1.04]"
        role="img"
        aria-label={`รูปประจำตัว ${displayName}`}
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt=""
            fill
            unoptimized
            sizes="44px"
            referrerPolicy="no-referrer"
            className="object-cover"
          />
        ) : (
          <GeneratedAvatar seed={avatarSeed || displayName} />
        )}
      </div>
    </div>
  );
}
