"use client"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowRight,
  Users,
  Heart,
  Sparkles,
  TrendingUp,
  Flame,
  Award,
  Target,
  ShieldCheck,
  Zap,
  Lightbulb,
  HeartHandshake,
  Instagram,
  Leaf
} from "lucide-react"


export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
    {/* Hero Section */}
{/* Breadcrumb */}


{/* Hero Section */}
{/* Breadcrumb */}


{/* Hero Section */}
<section className="relative flex flex-col items-center justify-start bg-black pt-8 pb-20 overflow-hidden mt-16 md:mt-24">

  <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
    {/* Tagline Pill */}
    

    {/* Main Heading */}
    <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] bg-clip-text text-transparent leading-tight">
      Crafted with Heart, Grounded in Tradition
    </h1>

    {/* Description */}
    <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
      What started as a small kitchen experiment became a passion to preserve India’s authentic regional flavors.  
      At <span className="text-[#FED649] font-semibold">KokoFresh</span>, we believe every spice tells a story — of warmth, purity, and the people who craft it.
    </p>
  </div>
</section>





<section className="py-20 bg-gradient-to-br from-[#DD9627] via-[#FED649] to-[#B47B2B] text-[#3B2B13]">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

      {/* LEFT: Text Content */}
      <div>
        {/* Tagline Pill */}
        <div className="inline-flex items-center gap-2 bg-[#3B2B13]/20 border border-[#3B2B13]/30 rounded-full px-4 py-2 mb-6 backdrop-blur-sm">
          <Sparkles className="h-4 w-4 text-[#FED649]" />
          <span className="text-sm font-bold text-[#3B2B13]/90">The KokoFresh Story</span>
        </div>

        {/* Heading */}
        <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
  From a{' '}
  <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#4B3A1F] via-[#7B5617] to-[#3B2B13]">
    Home Kitchen
  </span>{' '}
  to Your Heart
</h2>


        {/* Story Description */}
        <div className="space-y-6 text-lg text-[#3B2B13]/90 leading-relaxed">
          <p>
            KokoFresh began as a humble idea in a small home kitchen — an effort to
            recreate the <strong>flavors and memories that defined our childhood</strong> and
            preserve the timeless authenticity of regional Indian cuisines.
          </p>

          <p>
            Along this journey, we discovered something beautiful — the same dish never
            tastes the same across India. Each region, each family adds its own warmth
            and story. That realization inspired us to <strong>celebrate these differences</strong>
            by crafting authentic regional <em>FlavorZ</em>, so you can bring the
            <strong> taste of your home </strong> to your kitchen, wherever you are in the world.
          </p>

          <p>
            Today, KokoFresh is a <strong>community of women</strong> who lovingly recreate
            generational recipes born in their local kitchens — carefully blending tradition,
            purity, and passion into every pack.
          </p>
        </div>
      </div>

      {/* RIGHT: Image */}
      <div className="relative">
        <img
          src="https://static.wixstatic.com/media/e7c120_9ece78021480435893a5baa6132046bf~mv2.jpeg"
          alt="Women crafting traditional recipes"
          className="rounded-2xl shadow-2xl"
        />
        <div className="absolute -bottom-6 -right-6 bg-[#3B2B13]/30 text-white rounded-2xl p-6 shadow-xl backdrop-blur-sm">
          <div className="text-3xl font-black mb-2 text-[#FED649]">100K+</div>
          <div className="text-sm font-semibold text-[#FFF6D2]">Happy Kitchens Served</div>
        </div>
      </div>

    </div>
  </div>
</section>



{/* Ingredients Section */}
{/* Ingredients Section */}
<section className="py-20 bg-card/30">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

      {/* LEFT: Image */}
      <div className="relative order-2 lg:order-1">
        <img
          src="https://static.wixstatic.com/media/e7c120_01f9ee4a85624c248fd3434112bcb78e~mv2.jpeg"
          alt="Farm-sourced ingredients"
          className="rounded-2xl shadow-2xl"
        />
        <div className="absolute -bottom-6 -right-6 bg-[#DD9627] text-black rounded-2xl p-6 shadow-xl">
          <div className="text-3xl font-black mb-2">100%</div>
          <div className="text-sm font-semibold">Pure Ingredients</div>
        </div>
      </div>

      {/* RIGHT: Text */}
      <div className="order-1 lg:order-2">
        <div className="inline-flex items-center gap-2 bg-[#FED649]/30 text-[#B47B2B] rounded-full px-4 py-2 mb-6">
          <Leaf className="h-4 w-4" />
          <span className="text-sm font-bold">Our Ingredients & Promise</span>
        </div>

        <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">
          Sourced with{" "}
          <span className="bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] bg-clip-text text-transparent">
            Purity and Purpose
          </span>
        </h2>

        <Card className="bg-white/90 border-2 border-primary/20 shadow-xl">
          <CardContent className="p-8 space-y-6 text-[#3B2B13] leading-relaxed">
            <p>
              At KokoFresh, every ingredient begins its journey at
              <strong> trusted partner farms</strong> — where purity is a promise, not a claim.
              Each spice is handpicked and tested to ensure <strong>zero adulteration,
              complete traceability,</strong> and <strong>uncompromised quality.</strong>
            </p>

            <p>
              Our blends undergo <strong>rigorous quality checks</strong> to remain
              <strong> 100% pure, unadulterated,</strong> and completely
              <strong> free from palm oil and cottonseed oil</strong> — so what reaches
              your kitchen is <strong>exactly what nature intended.</strong>
            </p>

            <p>
              From farm to pack, every blend carries the
              <strong> aroma of tradition</strong> and the <strong>trust of authenticity</strong>,
              lovingly sealed for your kitchen.
            </p>
          </CardContent>
        </Card>
      </div>

    </div>
  </div>
</section>



      {/* Mission & Values */}
      {/* Mission & Values */}
{/* Mission & Values */}
<section className="py-20 bg-black text-white font-sans">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    {/* Section Heading */}
    <div className="text-center mb-16">
      <h2 className="font-serif font-bold text-4xl md:text-6xl mb-6 text-balance">
        What We{" "}
        <span className="bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] bg-clip-text text-transparent">
          Stand For
        </span>
      </h2>
      <p className="text-lg md:text-xl text-[#FED649]/80 font-light max-w-3xl mx-auto">
        Our values aren't just pretty words — they’re the essence of Kokofresh. Every blend reflects this promise.
      </p>
    </div>

    {/* Values Grid */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
  {[
        {
          icon: <ShieldCheck className="h-12 w-12 text-[#FED649]" />,
          title: "Authenticity First",
          description:
            "No shortcuts, no compromises. Every spice is crafted with care, echoing the flavors of true Indian kitchens.",
          stat: "100% Authentic",
        },
        {
          icon: <Lightbulb className="h-14 w-14 text-[#FED649] group-hover:scale-110 transition-transform duration-300" />,
          title: "Innovation Always",
          description:
            "We blend tradition with creativity — small-batch roasted, naturally preserved, and freshly packed for the modern table.",
          stat: "Always Fresh",
        },
        {
          icon: <HeartHandshake className="h-14 w-14 text-[#FED649] group-hover:scale-110 transition-transform duration-300" />,
          title: "Community Driven",
          description:
            "Our blends are inspired by you — our food-loving community that celebrates taste, culture, and togetherness.",
          stat: "For the People",
        },
      ].map((value, index) => (
    <Card
      key={index}
      className="bg-[#0D0D0D] border border-[#DD9627]/30 hover:border-[#FED649]/60 transition-all duration-300"
    >
      <CardContent className="p-8 text-center">
        <div className="mb-6 flex justify-center">{value.icon}</div>
        <h3 className="font-serif font-bold text-2xl mb-4 text-[#FED649]">
          {value.title}
        </h3>
        <p className="text-[#E6E6E6]/90 mb-4 leading-relaxed font-light">
          {value.description}
        </p>
        <div className="inline-block bg-[#FED649] text-black font-semibold px-5 py-2 rounded-full text-sm">
          {value.stat}
        </div>
      </CardContent>
    </Card>
  ))}
</div>

  </div>
</section>



      {/* Team Section - Meet the Spice Squad */}
      {/* <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-black text-4xl md:text-6xl mb-4">
              Meet the <span className="text-[#DD9627]">Spice Squad</span>
            </h2>
            <p className="text-lg text-[#5C3C0D] max-w-3xl mx-auto">
              The humans behind the hustle — young, passionate, and obsessively in love with flavor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Priya Sharma",
                role: "Founder & Chief Spice Officer",
                image: "/young-indian-woman-entrepreneur-smiling.jpg",
                bio: "Started this journey in her dorm room. Now she’s the spice queen of Gen Z India.",
                social: "@priya.spices",
              },
              {
                name: "Arjun Patel",
                role: "Head of Product & Taste",
                image: "/young-indian-man-chef-tasting-spices.jpg",
                bio: "Former chef turned spice scientist. If it doesn’t taste amazing, it doesn’t leave the lab.",
                social: "@arjun.tastes",
              },
              {
                name: "Sneha Gupta",
                role: "Community & Content Lead",
                image: "/young-indian-woman-content-creator-with-spices.jpg",
                bio: "The voice behind our viral content. She makes spices cool (and Insta-famous).",
                social: "@sneha.spices",
              },
            ].map((member, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#4B2E05]/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="font-bold text-xl mb-1">{member.name}</h3>
                      <p className="text-sm text-[#FED649] mb-2">{member.role}</p>
                      <p className="text-xs opacity-90 mb-2">{member.bio}</p>
                      <p className="text-xs font-bold">{member.social}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      {/* Awards & Recognition */}
      {/* <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-black text-4xl md:text-6xl mb-4">
              We're Kind of a <span className="text-[#DD9627]">Big Deal</span>
            </h2>
            <p className="text-lg text-[#5C3C0D] max-w-3xl mx-auto">
              Recognition for our craft, quality, and community — proof that freshness and honesty never go unnoticed.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                award: "Best New Brand 2023",
                org: "Food & Beverage Awards",
                icon: <Award className="h-8 w-8 text-[#DD9627]" />,
              },
              {
                award: "Gen Z Choice Award",
                org: "Youth Marketing Awards",
                icon: <TrendingUp className="h-8 w-8 text-[#DD9627]" />,
              },
              {
                award: "Startup of the Year",
                org: "Indian Food Tech",
                icon: <Flame className="h-8 w-8 text-[#DD9627]" />,
              },
              {
                award: "Social Impact Award",
                org: "Sustainable Business",
                icon: <Heart className="h-8 w-8 text-[#DD9627]" />,
              },
            ].map((recognition, index) => (
              <Card
                key={index}
                className="text-center p-6 hover:shadow-lg transition-shadow duration-300 border-2 border-[#FED649]/40 bg-white"
              >
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-[#FFF6D2] border border-[#FED649]/50">
                    {recognition.icon}
                  </div>
                </div>
                <h3 className="font-bold text-lg mb-2 text-[#4B2E05]">{recognition.award}</h3>
                <p className="text-sm text-[#5C3C0D] mb-4">{recognition.org}</p>
                
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
<section className="py-20 bg-white text-gray-900">
  <div className="max-w-4xl mx-auto text-center px-4">
    {/* Heading */}
    <h2 className="font-black text-4xl md:text-6xl mb-6 text-balance">
      Ready to{" "}
      <span className="bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] bg-clip-text text-transparent">
        Join Our Story?
      </span>
    </h2>

    {/* Description */}
    <p className="text-xl mb-8 text-muted-foreground">
      Every customer becomes part of our journey. Let’s write the next chapter together — one flavorful meal at a time.
    </p>

    {/* Buttons */}
    <div className="flex flex-col sm:flex-row gap-6 justify-center">
      {/* Solid Gradient Button */}
      <Button
        size="lg"
        className="bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] text-black font-bold text-lg px-8 py-4 flex items-center justify-center hover:brightness-90"
      >
        Start Your Flavor Journey
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>

      {/* Outline / Gradient Border Button */}
      <Button
        asChild
        size="lg"
        className="border-2 border-[#DD9627] text-[#DD9627] font-bold text-lg px-8 py-4 flex items-center justify-center bg-transparent hover:bg-gradient-to-r from-[#DD9627] via-[#FED649] to-[#B47B2B] hover:text-black transition-all duration-300"
      >
        <a
          href="https://www.instagram.com/koko_fresh_india"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Instagram className="mr-2 h-5 w-5" />
          Follow Our Journey
        </a>
      </Button>
    </div>

    {/* Footer note */}
    <p className="text-sm mt-6 text-muted-foreground">
      ✨ Use code STORY20 for 20% off your first order ✨
    </p>
  </div>
</section>



      <Footer />
    </div>
  )
}
