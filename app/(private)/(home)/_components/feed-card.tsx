import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import Image from "next/image"
import type { FeedItem } from "../_data/feed"

export function FeedCard({ item }: { item: FeedItem }) {
  return (
    <Card size="sm" className="overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-3 px-4 pt-4 pb-0">
        <Avatar>
          <AvatarFallback>{item.user.initials}</AvatarFallback>
        </Avatar>

        <div className="flex flex-1 flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{item.gcName || item.user.name}</span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">{item.tribe}</span>
          </div>
          <span className="text-xs text-muted-foreground">{item.date}</span>
        </div>

        <Badge variant={item.delivered >= (item.goal || 1) ? "default" : "secondary"}>
          {item.type}
        </Badge>
      </CardHeader>

      {item.photo && (
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
      )}

      <CardContent className="px-4 pb-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Quantidade</span>
          <span className="font-medium tabular-nums">{item.delivered}</span>
        </div>
      </CardContent>
    </Card>
  )
}
