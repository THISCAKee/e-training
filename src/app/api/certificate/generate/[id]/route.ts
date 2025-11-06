import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { readFileSync } from "fs";
import { join } from "path";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const userId = parseInt(session.user.id, 10);
  const quizId = parseInt(id, 10);

  if (isNaN(quizId) || isNaN(userId)) {
    return new NextResponse("Invalid ID", { status: 400 });
  }

  try {
    const latestPassedAttempt = await prisma.quizAttempt.findFirst({
      where: { userId, quizId, passed: true },
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
        quiz: {
          include: {
            lesson: {
              include: {
                course: { select: { title: true } },
              },
            },
          },
        },
      },
    });

    if (!latestPassedAttempt) {
      return new NextResponse("Certificate not found or not earned", {
        status: 404,
      });
    }

    const userName = latestPassedAttempt.user.name || "ผู้ใช้งาน";
    const courseTitle = latestPassedAttempt.quiz.lesson.course.title;
    const completionDate = latestPassedAttempt.createdAt.toLocaleDateString(
      "th-TH",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      },
    );

    // 1. อ่านไฟล์ logo และแปลงเป็น base64
    let logoBase64 = "";
    try {
      const logoPath = join(process.cwd(), "public", "logo02.png");
      const logoImage = readFileSync(logoPath);
      logoBase64 = `data:image/png;base64,${logoImage.toString("base64")}`;
    } catch (error) {
      console.error("Error reading logo file:", error);
      logoBase64 = `data:image/svg+xml;base64,${Buffer.from(
        `
        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 100 100">
          <rect width="100" height="100" fill="#f59e0b" rx="15"/>
          <text x="50" y="50" font-family="Anuphan" font-size="16" fill="white" text-anchor="middle" dominant-baseline="middle">LOGO</text>
        </svg>
      `,
      ).toString("base64")}`;
    }

    // 2. สร้าง HTML สำหรับใบประกาศ (ขนาด A4 แนวนอน)
    const certificateHtml = `
      <html>
        <head>
          <meta charset="utf-8" />
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Anuphan:wght@400;700&display=swap');

            /* ตั้งค่าขนาดหน้ากระดาษ A4 แนวนอน */
            @page {
              size: A4 landscape;
              margin: 0;
            }

            body {
              font-family: 'Anuphan', sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f3f4f6;
            }

            .certificate-container {
              width: 297mm; /* ความกว้าง A4 แนวนอน */
              height: 210mm; /* ความสูง A4 แนวนอน */
              position: relative;
              background-color: white;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }

            .certificate-border {
              position: absolute;
              top: 5mm;
              left: 5mm;
              right: 5mm;
              bottom: 5mm;
              border: 4px solid #f59e0b;
              border-radius: 8px;
              pointer-events: none;
            }

            .certificate-content {
              position: relative;
              z-index: 1;
              height: 100%;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              padding: 20mm;
            }

            .certificate-header {
              text-align: center;
              margin-bottom: 10mm;
              display: flex;
              flex-direction: column;
              align-items: center; /* เพิ่มบรรทัดนี้เพื่อจัดให้อยู่ตรงกลาง */
            }

            .logo-container {
              display: flex;
              justify-content: center;
              margin-top: -25px;
              margin-bottom: 15px; /* เพิ่มระยะห่างด้านล่างของ logo */
            }

            .certificate-title {
              font-size: 48px;
              font-weight: bold;
              color: #1f2937;
              margin: 0;
              line-height: 1.2;
            }

            .certificate-subtitle {
              font-size: 20px;
              color: #6b7280;
              margin: 5mm 0;
              margin-bottom: -80px
            }

            .certificate-body {
              text-align: center;
              flex-grow: 1;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
            }

            .certificate-name {
              font-size: 36px;
              font-weight: bold;
              color: #1f2937;
              margin: 5mm 0;
              line-height: 1.3;
            }

            .certificate-course {
              font-size: 24px;
              color: #4b5563;
              margin: 5mm 0;
            }

            .certificate-date {
              font-size: 18px;
              color: #6b7280;
              margin-top: 5mm;
            }

            .certificate-footer {
              text-align: center;
              margin-top: 15mm;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            .certificate-footer div{
              margin: 0 5mm;
              text-align: center;
            }

            .certificate-signature {
              font-size: 16px;
              color: #4b5563;
              margin-top: 5mm;
            }

            .certificate-star {
              width: 60px;
              height: 60px;
              margin: 5mm auto;
            }
          </style>
        </head>
        <body>
          <div class="certificate-container">
            <div class="certificate-border"></div>
            <div class="certificate-content">
              <div class="certificate-header">
                <div class="logo-container">
                  <img src="${logoBase64}" alt="Logo" width="100" height="100" />
                </div>
                <h1 class="certificate-title">ประกาศนียบัตร</h1>
                <p class="certificate-subtitle">มอบให้เพื่อแสดงว่า</p>
              </div>

              <div class="certificate-body">
                <p class="certificate-name">${userName}</p>
                <p class="certificate-course">ได้สำเร็จหลักสูตร "${courseTitle}"</p>
                <p class="certificate-date">เมื่อวันที่ ${completionDate}</p>
              </div>

              <div class="certificate-footer">

                <div>
                  <p class="certificate-signature">รองศาสตราจารย์ ดร.ประยุกต์ ศรีวิไล</p>
                  <p class="certificate-signature">อธิการบดีมหาวิทยาลัยมหาสารคาม</p>
                </div>


            </div>
          </div>
        </body>
      </html>
    `;

    // 3. ใช้ puppeteer สร้างรูปภาพ
    const puppeteer = await import("puppeteer");
    const browser = await puppeteer.default.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();

    // 4. ตั้งค่า viewport ให้เป็นขนาด A4 แนวนอน (297mm x 210mm) ที่ความละเอียด 150 DPI
    await page.setViewport({
      width: 1754, // 297mm * 150/25.4
      height: 1240, // 210mm * 150/25.4
      deviceScaleFactor: 1.5, // เพิ่มความละเอียด
    });

    // 5. ตั้งค่า timeout ให้นานขึ้น
    await page.setDefaultNavigationTimeout(60000);

    // 6. โหลด HTML
    await page.setContent(certificateHtml, { waitUntil: "networkidle0" });

    // 7. รอให้รูปภาพโหลดเสร็จ
    await page.waitForSelector("img", { timeout: 10000 });
    await page.waitForFunction(() => {
      const images = document.querySelectorAll("img");
      return Array.from(images).every((img) => img.complete);
    });

    // 8. รอให้ฟอนต์โหลดเสร็จ
    await page.waitForFunction(() => {
      return document.fonts.ready;
    });

    // 9. รอให้หน้าเว็บแสดงผลครบถ้วน
    await page.waitForSelector(".certificate-container", { timeout: 5000 });

    // 10. ถ่ายภาพ
    const elementHandle = await page.$(".certificate-container");
    let imageBuffer;

    if (elementHandle) {
      imageBuffer = await elementHandle.screenshot({
        type: "png",
        omitBackground: true,
      });
    } else {
      imageBuffer = await page.screenshot({
        type: "png",
        omitBackground: true,
      });
    }

    await browser.close();

    // 11. สร้างชื่อไฟล์ที่ปลอดภัย
    const safeFileName = `certificate-${quizId}-${Date.now()}.png`;

    // 12. แปลง Buffer เป็น Uint8Array อย่างถูกต้อง
    const uint8Array = new Uint8Array(imageBuffer);

    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `inline; filename="${safeFileName}"`,
      },
    });
  } catch (error) {
    console.error("IMAGE_GENERATION_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
