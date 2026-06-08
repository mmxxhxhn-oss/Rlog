import { Heart, MessageCircle, Share2, User } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getTechFeed } from "@/lib/db"

export default async function MomentsPage() {
  const techFeed = await getTechFeed()

  return (
    <div className="px-6 lg:px-8 pt-8 pb-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-semibold mb-2">技术动态</h1>
          <p className="text-muted-foreground">分享学习心得与技术感悟</p>
        </div>

        {/* Compose Box */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600">
                  <User className="w-5 h-5 text-white" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="分享你的技术想法..."
                  className="mb-3 resize-none"
                  rows={3}
                />
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">图片</Button>
                    <Button variant="ghost" size="sm">代码</Button>
                  </div>
                  <Button>发布</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feed */}
        <div className="space-y-6">
          {techFeed.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600">
                      <User className="w-5 h-5 text-white" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">技术探索者</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString("zh-CN")}
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-3 whitespace-pre-wrap">
                      {item.content}
                    </p>
                    {item.code_snippet && (
                      <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 mb-3 text-sm overflow-x-auto">
                        <code>{item.code_snippet}</code>
                      </pre>
                    )}
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <Button variant="ghost" size="sm" className="gap-1 hover:text-red-500">
                        <Heart className="w-4 h-4" />
                        {item.likes}
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1 hover:text-blue-500">
                        <MessageCircle className="w-4 h-4" />
                        评论
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1 hover:text-blue-500">
                        <Share2 className="w-4 h-4" />
                        分享
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}