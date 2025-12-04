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
      const logoPath = join(process.cwd(), "public", "logo03.png"); // หรือ logo02.png ตามที่คุณเลือก
      const logoImage = readFileSync(logoPath);
      logoBase64 = `data:image/png;base64,${logoImage.toString("base64")}`;
      
    } catch (error) {
      console.error("Error reading logo file:", error);
    }
    let logo1Base64 = "";
    try {
      const logo1Path = join(process.cwd(), "public", "logo04.png"); // เปลี่ยนชื่อไฟล์ตามต้องการ
      const logo1Image = readFileSync(logo1Path);
      logo1Base64 = `data:image/png;base64,${logo1Image.toString("base64")}`;
    } catch (error) {
      console.error("Error reading logo1 file:", error);
    }
    let bgBase64 = "";
    try {
      // อ่านไฟล์จาก public/certificate.jpg
      const bgPath = join(process.cwd(), "public", "certificate2.jpg");
      const bgImage = readFileSync(bgPath);
      // แปลงเป็น Base64 เพื่อฝังใน HTML
      bgBase64 = `data:image/jpeg;base64,${bgImage.toString("base64")}`;
    } catch (error) {
      console.error("Error reading background image:", error);
      // Fallback เป็นสีพื้นเรียบๆ ถ้าหาไฟล์ไม่เจอ
      bgBase64 = "";
    }
    // 1.1 อ่านไฟล์ signature และแปลงเป็น base64
    let signatureBase64 = "";
    try {
      const signaturePath = join(process.cwd(), "public", "signature.png");
      const signatureImage = readFileSync(signaturePath);
      signatureBase64 = `data:image/png;base64,${signatureImage.toString("base64")}`;
    } catch (error) {
      console.error("Error reading signature file:", error);
    }

    // 1.2 อ่านไฟล์ signature2 และแปลงเป็น base64
    let signature2Base64 = "";
    try {
      const signaturePath = join(process.cwd(), "public", "signature2.png");
      const signatureImage = readFileSync(signaturePath);
      signature2Base64 = `data:image/png;base64,${signatureImage.toString("base64")}`;
    } catch (error) {
      console.error("Error reading signature2 file:", error);
    }

    // 1.3 อ่านไฟล์ signature3 และแปลงเป็น base64
    let signature3Base64 = "";
    try {
      const signaturePath = join(process.cwd(), "public", "signature3.png");
      const signatureImage = readFileSync(signaturePath);
      signature3Base64 = `data:image/png;base64,${signatureImage.toString("base64")}`;
    } catch (error) {
      console.error("Error reading signature3 file:", error);
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
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              text-rendering: optimizeLegibility;
            }

            .certificate-container {
              width: 297mm; /* ความกว้าง A4 แนวนอน */
              height: 210mm; /* ความสูง A4 แนวนอน */
              position: relative;
              background-image: url('${bgBase64}');
              background-size: cover;
              background-position: center;
              background-repeat: no-repeat;
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
              align-items: center; /* จัดกึ่งกลางแนวตั้ง */
              gap: 20px; /* เพิ่มระยะห่างระหว่างโลโก้ */
              margin-top: -25px;
              margin-bottom: 15px;
            }
            
            .logo-img {
               width: 100px; /* กำหนดความกว้าง */
               height: 100px; /* กำหนดความสูง */
               object-fit: contain; /* ให้รูปคงสัดส่วน */
            }

            .certificate-title {
              font-size: 48px;
              font-weight: bold;
              color: white;
              margin: 3mm 0;
              line-height: 1.2;
            }

            .certificate-subtitle {
              font-size: 20px;
              color: white;
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
              color: #ffcc00;
              margin: 5mm 0;
              line-height: 1.3;
            }

            .certificate-course {
              font-size: 24px;
              color: white;
              margin: 5mm 0;
            }

            .certificate-date {
              font-size: 18px;
              color: white;
              margin-top: 5mm;
            }

            .certificate-footer {
              width: 100%;
              text-align: center;
              margin-top: 15mm;
              display: flex;
              justify-content: center;
              align-items: flex-start;
            }
            .certificate-footer > div {
              margin: 0 5mm;
              text-align: center;
              flex: 1;
              width: 0;
              display: flex;
              flex-direction: column;
              align-items: center;
            }

            .certificate-footer > div.center-signature {
              position: relative;
              top: -40px;
              transform: none;
              margin-bottom: 0;
            }

            .certificate-signature {
              font-size: 16px;
              color: white;
              margin-top: 5mm;
            }
            .signature-image {
              height: 40px; /* ปรับขนาดตามความเหมาะสม */
              margin-bottom: 5px;
              display: block;
              margin-left: auto;
              margin-right: auto;
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
                <img src="${logoBase64}" class="logo-img" alt="Logo 1" />
                <img src="${logo1Base64}" class="logo-img" alt="Logo 2" />
                </div>
                <h1 class="certificate-title">CERTIFICATE</h1>
                <p class="certificate-subtitle">มอบให้เพื่อแสดงว่า</p>
              </div>

              <div class="certificate-body">
                <p class="certificate-name">${userName}</p>
                <p class="certificate-course">ได้สำเร็จหลักสูตร "${courseTitle}"</p>
                <p class="certificate-date">เมื่อวันที่ ${completionDate}</p>
              </div>

              <div class="certificate-footer">

                <div>
                  ${
                    signatureBase64
                      ? `<img src="${signatureBase64}" class="signature-image" alt="Signature" />`
                      : ""
                  }
                  <p class="certificate-signature">รศ.ดร.ภญ.จันทร์ทิพย์ กาญจนศิลป์<br>รองอธิการบดีฝ่ายวิชาการและนวัตกรรม<br>การเรียนรู้</p>
                  
                </div>

                <div class="center-signature">
                  ${
                    signature2Base64
                      ? `<img src="${signature2Base64}" class="signature-image" alt="Signature 2" />`
                      : ""
                  }
                  <p class="certificate-signature">รองศาสตราจารย์ ดร.ประยุกต์ ศรีวิไล<br>อธิการบดีมหาวิทยาลัยมหาสารคาม</p>
                  
                </div>

                <div>
                  ${
                    signature3Base64
                      ? `<img src="${signature3Base64}" class="signature-image" alt="Signature 3" />`
                      : ""
                  }
                  <p class="certificate-signature">รองศาสตราจารย์ ดร.รัตนโชติ เทียนมงคล<br>ผู้อำนวยการสำนักวิทยบริการ</p>
                 
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
      deviceScaleFactor: 3, // เพิ่มความละเอียด
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
