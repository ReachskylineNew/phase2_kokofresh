"use client"
import { useEffect, useState } from "react"

export default function ReelsGrid() {
  const [reels, setReels] = useState<any[]>([])

  // useEffect(() => {
  //   fetch("/api/reels")
  //     .then(res => res.json())
  //     .then(data => setReels(data.data || []))
  // }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {reels.map((reel) => (
        <div key={reel._id} className="rounded-lg shadow p-2">
          <iframe
            src={`${reel.url}embed`}
            width="100%"
            height="500"
            frameBorder="0"
            scrolling="no"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            className="rounded-lg"
          />
          <h3 className="mt-2 text-lg font-semibold">{reel.title}</h3>
          <p className="text-gray-500 text-sm">{reel.thumbnail}</p>
        </div>
      ))}
    </div>
  )
}
