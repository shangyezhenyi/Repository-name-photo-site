import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

const client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    if (!file) return Response.json({ error: "missing file" }, { status: 400 })

    const key = `${Date.now()}-${file.name}`

    await client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET!,
        Key: key,
        Body: file.stream(),
        ContentType: file.type,
      })
    )

    const url = `${process.env.R2_PUBLIC_DOMAIN}/${key}`

    return Response.json({ key, url })
  } catch (err) {
    console.log("UPLOAD ERROR:", err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}