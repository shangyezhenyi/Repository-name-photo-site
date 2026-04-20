import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3"

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
    const { key } = await req.json()
    if (!key) return Response.json({ error: "缺少 key" }, { status: 400 })

    await client.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET!,
        Key: key,
      })
    )

    return Response.json({ success: true })
  } catch (err) {
    console.log(err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}