"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Heart, MessageCircle, Share, Play, Award, Star, Trophy, Medal } from "lucide-react"

const communityPosts = [
  {
    id: 1,
    username: "@spice_queen_23",
    avatar: "/community-avatar-1.jpg",
    image: "/community-post-sambhar-aesthetic.jpg",
    caption: "Her sambhar, but make it aesthetic ✨ #FlavourzOfIndia",
    likes: 2847,
    comments: 156,
    isVideo: false,
    featured: true,
  },
  {
    id: 2,
    username: "@foodie_gen_z",
    avatar: "/community-avatar-2.jpg",
    image: "/community-post-dosa-hack.jpg",
    caption: "Date night dosa hack that actually works! Thanks @flavourzofIndia for the perfect spice blend 🔥",
    likes: 3921,
    comments: 203,
    isVideo: true,
    featured: false,
  },
  {
    id: 3,
    username: "@chef_priya_home",
    avatar: "/community-avatar-3.jpg",
    image: "/community-post-chaat-bowl.jpg",
    caption: "Mumbai street vibes in my kitchen. This chaat masala is everything! #FlavourzOfIndia",
    likes: 1654,
    comments: 89,
    isVideo: false,
    featured: true,
  },
  {
    id: 4,
    username: "@couples_cook",
    avatar: "/community-avatar-4.jpg",
    image: "/community-post-cooking-together.jpg",
    caption: "Sunday cooking sessions hit different with authentic spices 👫 #FlavourzOfIndia",
    likes: 4567,
    comments: 312,
    isVideo: true,
    featured: false,
  },
  {
    id: 5,
    username: "@minimal_kitchen",
    avatar: "/community-avatar-5.jpg",
    image: "/community-post-spice-flatlay.jpg",
    caption: "When your spice collection is also your decor 🎨 #FlavourzOfIndia #SpiceArt",
    likes: 2103,
    comments: 145,
    isVideo: false,
    featured: true,
  },
  {
    id: 6,
    username: "@heritage_cook",
    avatar: "/community-avatar-6.jpg",
    image: "/community-post-traditional-cooking.jpg",
    caption: "Teaching my daughter the family recipes with modern spices. Tradition meets innovation! #FlavourzOfIndia",
    likes: 3456,
    comments: 198,
    isVideo: true,
    featured: false,
  },
]

const customerQuotes = [
  {
    id: 1,
    quote: "Her sambhar, but make it aesthetic.",
    author: "@spice_queen_23",
    context: "On transforming traditional recipes for social media",
  },
  {
    id: 2,
    quote: "Finally, spices that understand my kitchen's main character energy.",
    author: "@foodie_mumbai",
    context: "About our premium spice collection",
  },
  {
    id: 3,
    quote: "Not just cooking. Creating moments that matter.",
    author: "@chef_priya_home",
    context: "On the emotional connection to authentic flavors",
  },
  {
    id: 4,
    quote: "Every jar tells a story. Every meal writes a new chapter.",
    author: "@heritage_cook",
    context: "About passing down culinary traditions",
  },
]

const badgeSystem = [
  {
    level: "Bronze Ladle",
    icon: Medal,
    description: "First purchase & community join",
    points: "0-100 points",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    progress: 85,
  },
  {
    level: "Silver Pan",
    icon: Award,
    description: "Regular cooking & sharing recipes",
    points: "101-500 points",
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    progress: 45,
  },
  {
    level: "Gold Spice Jar",
    icon: Trophy,
    description: "Community leader & brand ambassador",
    points: "501+ points",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    progress: 12,
  },
]

export default function CommunityPage() {
  const [selectedTab, setSelectedTab] = useState("feed")

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-card py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 text-balance">#FlavourzOfIndia</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Join thousands of home cooks sharing their culinary adventures. Your kitchen, your story, our spices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Share Your Creation
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent">
              Join Community
            </Button>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setSelectedTab("feed")}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                selectedTab === "feed" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Community Feed
            </button>
            <button
              onClick={() => setSelectedTab("quotes")}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                selectedTab === "quotes" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Featured Quotes
            </button>
            <button
              onClick={() => setSelectedTab("badges")}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                selectedTab === "badges" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              Badge System
            </button>
          </div>
        </div>

        {/* Community Feed */}
        {selectedTab === "feed" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {communityPosts.map((post) => (
              <Card
                key={post.id}
                className={`group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden ${
                  post.featured ? "ring-2 ring-primary/20" : ""
                }`}
              >
                <CardContent className="p-0">
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={post.image || "/placeholder.svg"}
                      alt={`Post by ${post.username}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {post.isVideo && (
                      <div className="absolute top-3 right-3">
                        <div className="bg-black/70 backdrop-blur-sm rounded-full p-2">
                          <Play className="h-4 w-4 text-white fill-white" />
                        </div>
                      </div>
                    )}

                    {post.featured && (
                      <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">Featured</Badge>
                    )}

                    {/* Engagement overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-end">
                      <div className="p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-full">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <Heart className="h-4 w-4 mr-1" />
                              {post.likes.toLocaleString()}
                            </div>
                            <div className="flex items-center">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              {post.comments}
                            </div>
                          </div>
                          <Share className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={post.avatar || "/placeholder.svg"}
                        alt={post.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="font-medium text-sm">{post.username}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">{post.caption}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Featured Quotes */}
        {selectedTab === "quotes" && (
          <div className="max-w-4xl mx-auto space-y-12">
            {customerQuotes.map((quote, index) => (
              <div key={quote.id} className={`text-center ${index % 2 === 1 ? "text-right" : "text-left"}`}>
                <blockquote className="font-serif text-3xl md:text-4xl font-bold mb-4 text-balance leading-tight">
                  "{quote.quote}"
                </blockquote>
                <div className="text-muted-foreground">
                  <p className="font-medium mb-1">{quote.author}</p>
                  <p className="text-sm italic">{quote.context}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Badge System */}
        {selectedTab === "badges" && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-serif text-3xl font-bold mb-4">Culinary Achievement System</h2>
              <p className="text-lg text-muted-foreground">
                Earn points by cooking, sharing, and engaging with our community. Unlock exclusive perks as you level
                up!
              </p>
            </div>

            <div className="space-y-8">
              {badgeSystem.map((badge) => {
                const IconComponent = badge.icon
                return (
                  <Card key={badge.level} className="p-6">
                    <div className="flex items-center gap-6">
                      <div className={`p-4 rounded-full ${badge.bgColor}`}>
                        <IconComponent className={`h-8 w-8 ${badge.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-serif text-xl font-semibold">{badge.level}</h3>
                          <span className="text-sm text-muted-foreground">{badge.points}</span>
                        </div>
                        <p className="text-muted-foreground mb-3">{badge.description}</p>
                        <div className="flex items-center gap-3">
                          <Progress value={badge.progress} className="flex-1" />
                          <span className="text-sm font-medium">{badge.progress}%</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>

            <div className="text-center mt-12">
              <h3 className="font-serif text-2xl font-bold mb-4">How to Earn Points</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-4 text-center">
                  <Star className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Share Recipes</h4>
                  <p className="text-sm text-muted-foreground">+50 points per post</p>
                </Card>
                <Card className="p-4 text-center">
                  <Heart className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Engage with Community</h4>
                  <p className="text-sm text-muted-foreground">+10 points per interaction</p>
                </Card>
                <Card className="p-4 text-center">
                  <Trophy className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Monthly Challenges</h4>
                  <p className="text-sm text-muted-foreground">+100 points per completion</p>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
