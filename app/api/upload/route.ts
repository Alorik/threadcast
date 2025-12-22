import { NextRequest, NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // ✅ Validate type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    // ✅ Validate size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Image must be less than 5MB" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "threadcast/chat",
          resource_type: "image",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      stream.end(buffer);
    });

    return NextResponse.json(
      {
        url: result.secure_url,
        width: result.width,
        height: result.height,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("UPLOAD ERROR:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
