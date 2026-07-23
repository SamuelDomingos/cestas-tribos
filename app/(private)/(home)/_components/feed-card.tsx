import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import Image from "next/image"
import type { FeedItem } from "../_data/feed"
import { ProgressBar } from "./progress-bar"

interface FeedCardProps {
  item: FeedItem
}

export function FeedCard({ item }: FeedCardProps) {
  const isComplete = item.delivered >= item.goal

  return (
    <Card size="sm" className="overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-3 px-4 pt-4 pb-0">
        <Avatar>
          <AvatarFallback>{item.user.initials}</AvatarFallback>
        </Avatar>

        <div className="flex flex-1 flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{item.user.name}</span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">{item.tribe}</span>
          </div>
          <span className="text-xs text-muted-foreground">{item.date}</span>
        </div>

        <Badge variant={isComplete ? "default" : "secondary"}>
          {item.type}
        </Badge>
      </CardHeader>

      {/* Photo */}
      <CardContent className="px-0 pt-3">
        <div className="relative aspect-square w-full overflow-hidden bg-muted">
          <Image
            src={item.photo}
            alt={`Entrega de ${item.type}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 600px"
          />
        </div>
      </CardContent>

      {/* Progress */}
      <CardContent className="px-4 pb-4">
        <ProgressBar current={item.delivered} goal={item.goal} />
      </CardContent>
    </Card>
  )
}
