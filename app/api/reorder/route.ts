import { writeFile } from "fs/promises"
import path from "path"

const ORDER_FILE = path.join(process.cwd(), "imageOrder.json")

export async function POST(req: Request) {
  try {
    const { order } = await req.json()
    if (!order || !Array.isArray(order)) {
      return Response.json({ error: "missing order array" }, { status: 400 })
    }

    await writeFile(ORDER_FILE, JSON.stringify(order, null, 2), "utf-8")
    return Response.json({ success: true })
  } catch (err) {
    console.log("REORDER ERROR:", err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}