"use client"

import { useEffect, useRef, useState } from "react"

export default function Gallery() {
  const [file, setFile] = useState<File | null>(null)
  const [images, setImages] = useState<{ key: string, url: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [columns, setColumns] = useState(3)
  const [passwordInput, setPasswordInput] = useState("")
  const [accessGranted, setAccessGranted] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const PAGE_SIZE = 20

  // 密码检查
  const checkPassword = () => {
    if (passwordInput === process.env.NEXT_PUBLIC_APP_PASSWORD) {
      setAccessGranted(true)
    } else {
      alert("密码错误")
    }
  }

  // 瀑布流列数
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

  const fetchImages = async (pageNum: number) => {
    if (!hasMore || loading) return
    setLoading(true)
    try {
      const res = await fetch(`/api/list?page=${pageNum}&limit=${PAGE_SIZE}`)
      const data = await res.json()
      if (res.ok) {
        if (data.files.length < PAGE_SIZE) setHasMore(false)
        setImages(prev => [...prev, ...data.files])
      }
    } catch (err) {
      console.log(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (accessGranted) fetchImages(1)
  }, [accessGranted])

  // 无限滚动
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current
      if (scrollTop + clientHeight >= scrollHeight - 50 && hasMore && !loading) {
        setPage(prev => prev + 1)
        fetchImages(page + 1)
      }
    }
    const container = containerRef.current
    if (container) container.addEventListener("scroll", handleScroll)
    return () => container?.removeEventListener("scroll", handleScroll)
  }, [hasMore, loading, page])

  if (!accessGranted) {
    return (
      <main style={{ padding: 20 }}>
        <h1>🔒 输入访问密码</h1>
        <input
          type="password"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
        />
        <button onClick={checkPassword}>进入相册</button>
      </main>
    )
  }

  return (
    <main style={{ padding: 20, height: "100vh", overflow: "auto" }} ref={containerRef}>
      <h1>📷 云相册（密码保护 + 瀑布流 + 无限滚动）</h1>

      <div style={{ marginBottom: 20 }}>
        <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
        <button disabled={loading}>
          {loading ? "上传中..." : "上传"}
        </button>
      </div>

      <div style={{ columnCount: columns, columnGap: "10px" }}>
        {images.map((img, i) => (
          <div key={i} style={{ breakInside: "avoid", marginBottom: "10px" }}>
            <img src={img.url} style={{ width: "100%", borderRadius: 8, display: "block" }} />
          </div>
        ))}
      </div>

      {loading && <p style={{ textAlign: "center" }}>加载中...</p>}
      {!hasMore && <p style={{ textAlign: "center" }}>没有更多图片了</p>}
    </main>
  )
}