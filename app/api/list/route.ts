import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3"

const client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const page = Number(url.searchParams.get("page") || 1)
    const limit = Number(url.searchParams.get("limit") || 20)

    const res = await client.send(
      new ListObjectsV2Command({
        Bucket: process.env.R2_BUCKET!,
      })
    )

    const allFiles = res.Contents?.filter(item => item.Key).map(item => ({
      key: item.Key!,
      url: `${process.env.R2_PUBLIC_DOMAIN}/${item.Key}`,
    })) || []

    const start = (page - 1) * limit
    const files = allFiles.slice(start, start + limit)

    return Response.json({ files })
  } catch (err) {
    console.log("LIST ERROR:", err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}