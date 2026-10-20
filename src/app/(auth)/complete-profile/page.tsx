import { redirect } from "next/navigation";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { getFacultyOptions } from "@/lib/faculty-options";
import { isFacultyOrCollege } from "@/lib/faculties";
import { getLoginDestination } from "@/lib/auth/login-destination";
import CompleteProfileForm from "./CompleteProfileForm";

export default async function CompleteProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { callbackUrl = "/" } = await searchParams;
  const destination = getLoginDestination(session.user.role, callbackUrl);

  const user = await prisma.user.findUnique({
    where: { id: Number(session.user.id) },
    select: { name: true, studentId: true, faculty: true },
  });
  if (!user) redirect("/login");
  if (user.faculty) redirect(destination);

  // นิสิตเห็นเฉพาะคณะและวิทยาลัย บุคลากรเห็นทั้งหมดรวมสำนัก/กอง/ศูนย์
  const options = await getFacultyOptions();
  const faculties = user.studentId
    ? options.filter(isFacultyOrCollege)
    : options;

  return (
    <CompleteProfileForm
      name={user.name}
      studentId={user.studentId}
      faculties={faculties}
      destination={destination}
    />
  );
}
