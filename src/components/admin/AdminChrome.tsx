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
      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-sm">
        <Image
          src="/logo_etraining.png"
          alt="MSU AI-Training"
          width={40}
          height={40}
          className="h-full w-full object-cover"
        />
      </div>
      <div>
        <p className="text-[0.67rem] font-bold uppercase tracking-[0.2em] text-blue-700">
          MSU
        </p>
        <p className="text-sm font-semibold text-slate-900">AI-Training</p>
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
    <div className="flex min-w-0 items-center gap-3 rounded-full border border-white/80 bg-white/60 py-1.5 pl-3 pr-1.5 shadow-[0_6px_24px_rgba(18,55,66,0.07)] backdrop-blur-xl transition duration-200 hover:bg-white/85 hover:shadow-[0_10px_30px_rgba(18,55,66,0.11)]">
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
