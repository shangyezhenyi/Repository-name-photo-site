"use client"

import { useEffect, useRef, useState } from "react"

export default function Gallery() {
  const [file, setFile] = useState<File | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [columns, setColumns] = useState(3)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const PAGE_SIZE = 20

  // 根据窗口宽度计算列数
  const updateColumns = () => {
    const width = window.innerWidth
    if (width < 600) setColumns(1)
    else if (width < 900) setColumns(2)
    else if (width < 1200) setColumns(3)
    else setColumns(4)
  }

  useEffect(() => {
    updateColumns()
    window.addEventListener("resize", updateColumns)
    return () => window.removeEventListener("resize", updateColumns)
  }, [])

  // 获取图片
  const fetchImages = async (pageNum: number) => {
    if (!hasMore || loading) return
    setLoading(true)
    try {
      const res = await fetch(`/api/list?page=${pageNum}&limit=${PAGE_SIZE}`)
      const data = await res.json()
      if (res.ok) {
        if (data.files.length < PAGE_SIZE) setHasMore(false)
        setImages((prev) => [...prev, ...data.files])
      } else {
        console.log(data)
      }
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchImages(1)
  }, [])

  // 无限滚动监听
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current
      if (scrollTop + clientHeight >= scrollHeight - 50 && hasMore && !loading) {
        setPage((prev) => prev + 1)
        fetchImages(page + 1)
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener("scroll", handleScroll)
    }
    return () => container?.removeEventListener("scroll", handleScroll)
  }, [hasMore, loading, page])

  // 拖拽事件
  const onDragStart = (index: number) => setDraggingIndex(index)
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault()
  const onDrop = async (index: number) => {
    if (draggingIndex === null || draggingIndex === index) return
    const newImages = [...images]
    const [moved] = newImages.splice(draggingIndex, 1)
    newImages.splice(index, 0, moved)
    setImages(newImages)
    setDraggingIndex(null)

    // 保存顺序到后端
    try {
      const keys = newImages.map((url) => url.split("/").pop())
      await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keys }),
      })
    } catch (err) {
      console.log("保存顺序失败:", err)
    }
  }

  // 上传图片
  const upload = async () => {
    if (!file) return alert("请选择图片")
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) {
        alert("上传失败")
        console.log(data)
        return
      }
      setImages((prev) => [data.url, ...prev])
      setFile(null)
      alert("上传成功 🎉")
    } catch (err) {
      console.log(err)
      alert("上传失败（网络错误）")
    } finally {
      setLoading(false)
    }
  }

  // 删除图片
  const removeImage = async (url: string) => {
    if (!confirm("确认删除这张图片吗？")) return
    try {
      const key = url.split("/").pop()
      const res = await fetch("/api/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setImages((prev) => prev.filter((u) => u !== url))
      } else {
        alert("删除失败")
        console.log(data)
      }
    } catch (err) {
      console.log(err)
      alert("删除失败（网络错误）")
    }
  }

  return (
    <main style={{ padding: 20, height: "100vh", overflow: "auto" }} ref={containerRef}>
      <h1>📷 云相册（上传 + 删除 + 拖拽排序 + 无限滚动 + 瀑布流）</h1>

      <div style={{ marginBottom: 20 }}>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button onClick={upload} disabled={loading}>{loading ? "上传中..." : "上传"}</button>
      </div>

      <div style={{ columnCount: columns, columnGap: "10px" }}>
        {images.map((url, i) => (
          <div
            key={i}
            draggable
            onDragStart={() => onDragStart(i)}
            onDragOver={onDragOver}
            onDrop={() => onDrop(i)}
            style={{ breakInside: "avoid", marginBottom: "10px", position: "relative" }}
          >
            <img src={url} style={{ width: "100%", borderRadius: 8, display: "block" }} />
            <button
              onClick={() => removeImage(url)}
              style={{
                position: "absolute",
                top: 5,
                right: 5,
                background: "rgba(255,0,0,0.7)",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                padding: "2px 6px",
                cursor: "pointer"
              }}
            >
              删除
            </button>
          </div>
        ))}
      </div>

      {loading && <p style={{ textAlign: "center" }}>加载中...</p>}
      {!hasMore && <p style={{ textAlign: "center" }}>没有更多图片了</p>}
    </main>
  )
}