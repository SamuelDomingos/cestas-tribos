import { ScrollArea } from "@/components/ui/scroll-area"
import { FeedCard } from "./_components/feed-card"
import { feed } from "./_data/feed"

export default function HomeFeed() {
  return (
    <ScrollArea className="h-full">
      <div className="mx-auto max-w-lg space-y-6 pb-20 pt-6">
        <div className="space-y-6">
          {feed.map((item) => (
            <FeedCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </ScrollArea>
  )
}
