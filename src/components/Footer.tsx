// src/components/Footer.tsx
import Image from "next/image";
import Link from "next/link";
export default function Footer() {
  return (
    <footer className="bg-gray-300 border-t mt-auto ">
      <div className="container mx-auto px-6 py-4 text-center text-gray-600">
        <Link href="/" className="flex justify-center items-center gap-10">
          <Image
            src="/logo02.png"
            alt=""
            width={70}
            height={70}
            className="rounded-md"
          />
          <Image
            src="/logo01.png"
            alt=""
            width={100}
            height={70}
            className="rounded-md"
          />
        </Link>
        <p>
          &copy; {new Date().getFullYear()} E-Training Platform. Mahasarakham
          University.
        </p>
      </div>
    </footer>
  );
}
