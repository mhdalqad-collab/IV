import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";
// Allow large-ish uploads (videos). nginx must also permit this body size.
export const maxDuration = 60;

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB raw input
const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50MB
const MAX_FILES = 12;

const VIDEO_EXT: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/ogg": "ogv",
  "video/quicktime": "mp4", // .mov — most browsers play H.264 mp4-muxed; keep container hint
};

// UPLOADS_DIR must point at the dir nginx serves for /uploads/. The cwd
// fallback is wrong under the standalone server (cwd = .next/standalone,
// which next build wipes) — files written there 404 via nginx and are lost.
const uploadsDir =
  process.env.UPLOADS_DIR || path.join(process.cwd(), "public", "uploads");

function uniqueName(ext: string) {
  return `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  // Node 18 has no global `File`, so check `Blob` (uploaded file entries extend it).
  const files = form.getAll("files").filter((f): f is File => f instanceof Blob);
  if (!files.length)
    return NextResponse.json({ error: "no_files" }, { status: 400 });
  if (files.length > MAX_FILES)
    return NextResponse.json({ error: "too_many_files" }, { status: 400 });

  try {
    await mkdir(uploadsDir, { recursive: true });

    const results: { url: string; kind: "image" | "video" }[] = [];

    for (const file of files) {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");

      if (isImage) {
        if (file.size > MAX_IMAGE_BYTES)
          return NextResponse.json({ error: "image_too_large" }, { status: 413 });
        const input = Buffer.from(await file.arrayBuffer());
        // Normalize orientation, cap dimensions, re-encode to webp.
        const output = await sharp(input)
          .rotate()
          .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();
        const name = uniqueName("webp");
        await writeFile(path.join(uploadsDir, name), output);
        results.push({ url: `/uploads/${name}`, kind: "image" });
      } else if (isVideo) {
        const ext = VIDEO_EXT[file.type];
        if (!ext)
          return NextResponse.json({ error: "unsupported_video" }, { status: 415 });
        if (file.size > MAX_VIDEO_BYTES)
          return NextResponse.json({ error: "video_too_large" }, { status: 413 });
        const buf = Buffer.from(await file.arrayBuffer());
        const name = uniqueName(ext);
        await writeFile(path.join(uploadsDir, name), buf);
        results.push({ url: `/uploads/${name}`, kind: "video" });
      } else {
        return NextResponse.json({ error: "unsupported_type" }, { status: 415 });
      }
    }

    return NextResponse.json({ files: results }, { status: 201 });
  } catch (e) {
    console.error("upload error", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
