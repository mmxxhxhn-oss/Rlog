import { Globe, Star, GitFork, ExternalLink, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getProjects } from "@/lib/db"

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <div className="px-6 lg:px-8 pt-8 pb-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-semibold mb-2">项目仓库</h1>
          <p className="text-muted-foreground">开源项目与技术实践</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="hover:shadow-lg hover:border-blue-200 transition-all duration-300"
            >
              <CardHeader className="p-6 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium">{project.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Calendar className="w-3 h-3" />
                        {project.created_at.split("T")[0]}
                      </div>
                    </div>
                  </div>
                  {project.demo_url && (
                    <a
                      href={project.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-accent rounded-lg transition-colors"
                    >
                      <ExternalLink className="w-5 h-5 text-muted-foreground" />
                    </a>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    {project.stars.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork className="w-4 h-4" />
                    {project.forks?.toLocaleString() || 0}
                  </span>
                </div>
                {project.repo_url && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <a
                      href={project.repo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <Globe className="w-4 h-4" />
                      查看源码
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}