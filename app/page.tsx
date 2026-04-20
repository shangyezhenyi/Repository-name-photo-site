"use client"

import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      background: "#0f0f0f",
      color: "white",
      fontFamily: "Arial"
    }}>
      <h1 style={{ fontSize: "48px", marginBottom: "20px" }}>
        我的照片网站
      </h1>

      <p style={{ fontSize: "18px", opacity: 0.7 }}>
        用来存储和展示我的图片
      </p>

      <button
        onClick={() => router.push("/gallery")}
        style={{
          marginTop: "30px",
          padding: "12px 24px",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          background: "white",
          color: "black",
          fontSize: "16px"
        }}
      >
        进入相册
      </button>
    </main>
  )
}