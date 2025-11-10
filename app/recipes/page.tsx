"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Clock, Users, Leaf, Upload, Heart, MessageCircle, Share } from "lucide-react"

const recipes = [
  {
    id: 1,
    title: "3 min Maggi Glow-up",
    description: "Transform instant noodles into a gourmet experience with our secret spice blend",
    image: "/maggi-glow-up-recipe-video.jpg",
    duration: "3 min",
    difficulty: "Easy",
    servings: 1,
    tags: ["Quick", "Comfort Food"],
    vegan: false,
    regional: "Fusion",
    videoThumbnail: true,
    likes: 2847,
    comments: 156,
  },
  {
    id: 2,
    title: "Date Night Dosa Hack",
    description: "Crispy, golden dosas that'll impress without the stress",
    image: "/date-night-dosa-hack-recipe.jpg",
    duration: "15 min",
    difficulty: "Medium",
    servings: 2,
    tags: ["Romantic", "Traditional"],
    vegan: true,
    regional: "South Indian",
    videoThumbnail: true,
    likes: 3921,
    comments: 203,
  },
  {
    id: 3,
    title: "Mumbai Street Chaat Bowl",
    description: "All the flavors of Mumbai street food in a healthy bowl",
    image: "/mumbai-chaat-bowl-recipe.jpg",
    duration: "10 min",
    difficulty: "Easy",
    servings: 2,
    tags: ["Healthy", "Street Food"],
    vegan: true,
    regional: "Western Indian",
    videoThumbnail: false,
    likes: 1654,
    comments: 89,
  },
  {
    id: 4,
    title: "Grandma's Secret Sambhar",
    description: "The family recipe that's been passed down for generations",
    image: "/grandma-secret-sambhar-recipe.jpg",
    duration: "25 min",
    difficulty: "Medium",
    servings: 4,
    tags: ["Traditional", "Family Recipe"],
    vegan: true,
    regional: "South Indian",
    videoThumbnail: true,
    likes: 4567,
    comments: 312,
  },
  {
    id: 5,
    title: "Spiced Chai Latte Art",
    description: "Barista-level chai with homemade spice blend and latte art tips",
    image: "/spiced-chai-latte-art-recipe.jpg",
    duration: "8 min",
    difficulty: "Easy",
    servings: 1,
    tags: ["Beverages", "Instagram-worthy"],
    vegan: false,
    regional: "Pan-Indian",
    videoThumbnail: false,
    likes: 2103,
    comments: 145,
  },
  {
    id: 6,
    title: "Fusion Butter Chicken Pasta",
    description: "East meets West in this creamy, spiced pasta dish",
    image: "/fusion-butter-chicken-pasta-recipe.jpg",
    duration: "20 min",
    difficulty: "Medium",
    servings: 3,
    tags: ["Fusion", "Comfort Food"],
    vegan: false,
    regional: "Fusion",
    videoThumbnail: true,
    likes: 3456,
    comments: 198,
  },
  {
    id: 7,
    title: "5-Minute Coconut Chutney",
    description: "Fresh, creamy chutney that pairs with everything",
    image: "/coconut-chutney-quick-recipe.jpg",
    duration: "5 min",
    difficulty: "Easy",
    servings: 4,
    tags: ["Quick", "Condiment"],
    vegan: true,
    regional: "South Indian",
    videoThumbnail: false,
    likes: 1876,
    comments: 67,
  },
  {
    id: 8,
    title: "Tandoori Cauliflower Steaks",
    description: "Smoky, spiced cauliflower that's restaurant-quality at home",
    image: "/tandoori-cauliflower-steaks-recipe.jpg",
    duration: "30 min",
    difficulty: "Medium",
    servings: 2,
    tags: ["Healthy", "Vegetarian"],
    vegan: true,
    regional: "North Indian",
    videoThumbnail: true,
    likes: 2934,
    comments: 178,
  },
]

export default function RecipesPage() {
  const [selectedFilter, setSelectedFilter] = useState<string>("all")
  const [selectedRegion, setSelectedRegion] = useState<string>("all")

  const filters = [
    { id: "all", label: "All Recipes" },
    { id: "vegan", label: "Vegan" },
    { id: "quick", label: "15 min" },
    { id: "regional", label: "Regional" },
  ]

  const regions = [
    { id: "all", label: "All Regions" },
    { id: "South Indian", label: "South Indian" },
    { id: "North Indian", label: "North Indian" },
    { id: "Western Indian", label: "Western Indian" },
    { id: "Fusion", label: "Fusion" },
    { id: "Pan-Indian", label: "Pan-Indian" },
  ]

  const filteredRecipes = recipes.filter((recipe) => {
    if (selectedFilter === "vegan" && !recipe.vegan) return false
    if (selectedFilter === "quick" && Number.parseInt(recipe.duration) > 15) return false
    if (selectedRegion !== "all" && recipe.regional !== selectedRegion) return false
    return true
  })

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-card py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif text-4xl md:text-6xl font-bold mb-6 text-balance">Cook it like a moodboard</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Instagram-worthy recipes that actually taste as good as they look. From quick fixes to weekend projects.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                variant={selectedFilter === filter.id ? "default" : "outline"}
                onClick={() => setSelectedFilter(filter.id)}
                className={selectedFilter === filter.id ? "bg-primary" : "bg-transparent"}
              >
                {filter.label}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {regions.map((region) => (
              <Button
                key={region.id}
                variant={selectedRegion === region.id ? "default" : "outline"}
                onClick={() => setSelectedRegion(region.id)}
                className={selectedRegion === region.id ? "bg-accent" : "bg-transparent"}
                size="sm"
              >
                {region.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Recipe Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
          {filteredRecipes.map((recipe) => (
            <Card
              key={recipe.id}
              className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <CardContent className="p-0">
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={recipe.image || "/placeholder.svg"}
                    alt={recipe.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Video indicator */}
                  {recipe.videoThumbnail && (
                    <div className="absolute top-3 right-3">
                      <div className="bg-black/70 backdrop-blur-sm rounded-full p-2">
                        <Play className="h-4 w-4 text-white fill-white" />
                      </div>
                    </div>
                  )}

                  {/* Duration badge */}
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-black/70 text-white backdrop-blur-sm">
                      <Clock className="h-3 w-3 mr-1" />
                      {recipe.duration}
                    </Badge>
                  </div>

                  {/* Tags */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex flex-wrap gap-1">
                      {recipe.vegan && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                          <Leaf className="h-3 w-3 mr-1" />
                          Vegan
                        </Badge>
                      )}
                      {recipe.tags.slice(0, 1).map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-white/90 text-foreground text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Hover overlay with engagement */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-end">
                    <div className="p-3 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-full">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center">
                            <Heart className="h-4 w-4 mr-1" />
                            {recipe.likes.toLocaleString()}
                          </div>
                          <div className="flex items-center">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            {recipe.comments}
                          </div>
                        </div>
                        <Share className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-serif text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-1">
                    {recipe.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{recipe.description}</p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {recipe.servings}
                      </span>
                      <span>{recipe.difficulty}</span>
                    </div>
                    <span>{recipe.regional}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Upload CTA */}
        <section className="text-center py-16 bg-card rounded-lg">
          <div className="max-w-2xl mx-auto px-6">
            <Upload className="h-16 w-16 text-primary mx-auto mb-6" />
            <h2 className="font-serif text-3xl font-bold mb-4 text-balance">Your kitchen. Your flex.</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Tag us @flavourzofIndia to feature your creations in our community recipe collection.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Upload Your Recipe
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent">
                Join Our Community
              </Button>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
