"use client"

import { useState, useEffect } from "react"

interface PrivateImageProps {
  src: string
  alt: string
  className?: string
  onLoad?: () => void
  onError?: () => void
}

export function PrivateImage({ src, alt, className, onLoad, onError }: PrivateImageProps) {
  const [imgSrc, setImgSrc] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    // If it's already a signed URL or external URL, use it directly
    if (src.startsWith("http") && !src.includes("/api/image/")) {
      setImgSrc(src)
      return
    }

    // If it's our proxy URL, fetch signed URL
    const fetchSignedUrl = async () => {
      try {
        const baseUrl = window.location.origin
        const signedUrlEndpoint = src.startsWith("/api/image/")
          ? `/api/images/signed?url=${encodeURIComponent(baseUrl + src)}`
          : `/api/images/signed?url=${encodeURIComponent(src)}`

        const res = await fetch(signedUrlEndpoint)
        const data = await res.json()

        if (data.url) {
          setImgSrc(data.url)
        } else {
          setError(true)
        }
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchSignedUrl()
  }, [src])

  const handleLoad = () => {
    setLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setError(true)
    setLoading(false)
    onError?.()
  }

  if (error) {
    return (
      <div className={`bg-muted flex items-center justify-center ${className || ""}`}>
        <span className="text-sm text-muted-foreground">图片加载失败</span>
      </div>
    )
  }

  return (
    <div className="relative inline-block">
      {loading && (
        <div className={`absolute inset-0 bg-muted flex items-center justify-center ${className || ""}`}>
          <span className="text-sm text-muted-foreground">加载中...</span>
        </div>
      )}
      {imgSrc && (
        <img
          src={imgSrc}
          alt={alt}
          className={className}
          onLoad={handleLoad}
          onError={handleError}
          style={{ display: loading ? "none" : "block" }}
        />
      )}
    </div>
  )
}