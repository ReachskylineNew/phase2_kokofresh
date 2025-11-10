"use client"
import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"

const ManufacturingProcess = () => {
  const [activeStage, setActiveStage] = useState("1")
  const sectionRefs = useRef({})
  const [isMobile, setIsMobile] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const stepperRef = useRef<HTMLDivElement | null>(null)
  const [headerOffset, setHeaderOffset] = useState(64)
  const [stepperHeight, setStepperHeight] = useState(0)

  const flowData = [
    {
      id: "1",
      image:
        "https://static.wixstatic.com/media/e7c120_8ca87a51476b428493de54935c975cb9~mv2.webp",
      title: "Farm Sourcing",
      description:
        "Our process begins right at the source — partnering with trusted local farmers who cultivate pure, chemical-free ingredients. Every batch is hand-selected to ensure natural aroma, color, and nutritional integrity.",
    },
    {
      id: "2",
      image:
        "https://static.wixstatic.com/media/e7c120_6a96aaaeddf34b3e9aa6e013c8403966~mv2.webp",
      title: "Cleaning & Sorting",
      description:
        "Each ingredient goes through gentle, multi-stage cleaning — removing dust, stones, and impurities without affecting the grain’s natural essence. Only the freshest, most authentic ingredients move forward.",
    },
    {
      id: "3",
      image:
        "https://static.wixstatic.com/media/e7c120_f1d24fe0c4c94f0985096cc14778c870~mv2.webp",
      title: "Sun Drying",
      description:
        "We follow traditional sun-drying methods — a slow, natural process that locks in authentic flavor and extends shelf life without artificial preservatives. This step brings out the true aroma of every spice and pulse.",
    },
    {
      id: "4",
      image:
        "https://static.wixstatic.com/media/e7c120_c12434af189544f684ed4584500b2934~mv2.webp",
      title: "Grinding & Blending",
      description:
        "Using cold-grind technology, ingredients are finely milled to preserve essential oils and nutrients. Expertly balanced blends are then crafted in small batches — bringing you the authentic taste of home, every time.",
    },
    {
      id: "5",
      image:
        "https://static.wixstatic.com/media/e7c120_00283047c35e42a5aa38d7d6573141f3~mv2.webp",
      title: "Packing",
      description:
        "Freshly ground and blended spices are packed immediately in food-grade, air-tight materials to lock in freshness and aroma. Every pack of KoKoFresh carries the purity of tradition — sealed with care, ready for your kitchen.",
    },
    {
  id: "6",
  image:
    "https://static.wixstatic.com/media/e7c120_ebe2fbe9e9ad449d8de7dff8bbdd3228~mv2.webp", // (you can replace with your delivery/parcel image)
  title: "Delivery with Care",
  description:
    "Once sealed, every KokoFresh pack begins its journey from our facility to your doorstep with the same love and attention that went into making it. We partner with trusted delivery services to ensure your spices arrive fresh, intact, and right on time — ready to flavor your next meal.",
}
  ]

  // Detect if device is mobile/tablet
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024)
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Intersection Observer (desktop only)
  useEffect(() => {
    if (isMobile) return
    const observerOptions = {
      root: null,
      rootMargin: "0px 0px -50% 0px",
      threshold: 0,
    }
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveStage(entry.target.dataset.id)
      })
    }
    const observer = new IntersectionObserver(observerCallback, observerOptions)
    flowData.forEach((item) => {
      const ref = sectionRefs.current[item.id]
      if (ref) observer.observe(ref)
    })
    return () => observer.disconnect()
  }, [isMobile])

  // Intersection Observer (mobile)
  useEffect(() => {
    if (!isMobile) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveStage(entry.target.dataset.id)
        })
      },
      {
        root: null,
        threshold: 0.6,
        rootMargin: "-20% 0px -20% 0px",
      },
    )
    flowData.forEach((item) => {
      const ref = sectionRefs.current[item.id]
      if (ref) observer.observe(ref)
    })
    return () => observer.disconnect()
  }, [isMobile])

  // Detect reduced motion
  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)")
    const onChange = () => setReduceMotion(mql.matches)
    onChange()
    mql.addEventListener?.("change", onChange)
    return () => mql.removeEventListener?.("change", onChange)
  }, [])

  // Measure fixed header + stepper height on mobile
  useEffect(() => {
    if (!isMobile) return
    const measure = () => {
      try {
        const candidates = Array.from(document.querySelectorAll("header, [data-header], nav")) as HTMLElement[]
        const topAnchored = candidates.filter((el) => {
          const s = getComputedStyle(el)
          return (s.position === "fixed" || s.position === "sticky") && parseInt(s.top || "0", 10) === 0
        })
        const headerH = topAnchored.length ? Math.max(...topAnchored.map((el) => el.getBoundingClientRect().height)) : 0
        setHeaderOffset(Math.max(56, headerH))
        setStepperHeight(stepperRef.current?.getBoundingClientRect().height || 0)
      } catch {
        setHeaderOffset(56)
        setStepperHeight(stepperRef.current?.getBoundingClientRect().height || 0)
      }
    }
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [isMobile])

  const activeIndex = flowData.findIndex((i) => i.id === activeStage)
  const goToStep = (id: string) => {
    const target = sectionRefs.current[id] as HTMLElement | undefined
    if (!target) return
    if (isMobile) {
      const y = window.scrollY + target.getBoundingClientRect().top - (headerOffset + stepperHeight + 12)
      window.scrollTo({ top: y, behavior: "smooth" })
    } else {
      target.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  const activeImage = flowData.find((item) => item.id === activeStage)?.image
  const fadeUp = {
    initial: { opacity: 0, y: reduceMotion ? 0 : 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduceMotion ? 0 : 0.8 },
  }
  const imgTransition = { duration: reduceMotion ? 0 : 0.6 }

  return (
    <div
      ref={containerRef}
      className="relative lg:pt-28 flex flex-col lg:flex-row lg:min-h-[250vh] p-6 sm:p-8 lg:p-20 bg-gradient-to-br from-[#DD9627] via-[#FED649] to-[#B47B2B] text-[#4B3A1F]"

    >
      {/* Process Heading */}
      <motion.div
        initial={fadeUp.initial}
        animate={fadeUp.animate}
        transition={fadeUp.transition}
        className={
          isMobile
            ? "relative w-full text-center mb-3 sm:mb-4 z-10"
            : "absolute top-10 left-1/2 -translate-x-1/2 transform text-center z-10"
        }
      >
       <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#3B2B13] mb-2">
  Our Process
</h1>
<p className="text-lg sm:text-xl text-[#4B3A1F] font-medium">
  The <span className="text-[#3B2B13] font-semibold">KoKoFresh</span> Way — from Farm to Pack
</p>

      </motion.div>

      {/* Mobile Stepper */}
      {isMobile && (
        <div className="sticky z-20 mb-3 -mt-1" style={{ top: headerOffset }}>
          <nav
            ref={stepperRef}
            className="rounded-2xl border border-[#FED649]/40 bg-white/80 backdrop-blur px-2 py-2 shadow-sm"
          >
            <div className="flex items-center justify-between gap-2">
              {flowData.map((step) => (
                <button
                  key={step.id}
                  onClick={() => goToStep(step.id)}
                  className={`${
                    activeStage === step.id
                      ? "bg-[#DD9627] text-white shadow"
                      : "bg-[#FED649]/40 text-[#B47B2B]"
                  } w-9 h-9 rounded-full text-sm font-bold grid place-items-center transition-colors`}
                >
                  {step.id}
                </button>
              ))}
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-[#EDCC32]/30 relative overflow-hidden">
              <div
                className="h-full bg-[#DD9627] transition-[width]"
                style={{ width: `${((activeIndex + 1) / flowData.length) * 100}%` }}
              />
            </div>
          </nav>
        </div>
      )}

      {/* Left Image (Desktop) */}
      {!isMobile && (
        <div className="sticky top-24 lg:w-1/2 h-[calc(100vh-6rem)] flex justify-center items-center mb-8 lg:mb-0">
            <motion.div
            key={activeImage}
            initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={imgTransition}
            className="w-100 h-100 rounded-2xl shadow-2xl border-4 border-[#FED649]/50 overflow-hidden"
          >
            <Image
              src={activeImage || "/placeholder.svg"}
              alt="Active Stage"
              width={500}
              height={500}
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
      )}

      {/* Right Scroll Section */}
   <div
        className={`${
          isMobile ? "w-full snap-y snap-proximity" : "lg:w-5/12 w-full lg:ml-20"
        } flex flex-col ${isMobile ? "gap-10" : "gap-20 sm:gap-28"}`}
      >
        {flowData.map((item) => (
          <div
            key={item.id}
            data-id={item.id}
            ref={(el) => (sectionRefs.current[item.id] = el)}
            className={`flex flex-col justify-center border-b border-[#3B2B13]/30 pb-10 ${
              isMobile
                ? "min-h-[60vh] snap-start rounded-2xl border border-[#3B2B13]/20 bg-white/80 shadow-md p-4"
                : "min-h-[80vh]"
            }`}
          >
            {isMobile && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true, amount: 0.4 }}
                className="flex justify-center mb-4"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  width={400}
                  height={300}
                  className="w-full rounded-xl shadow-lg border border-[#3B2B13]/30 object-cover"
                />
              </motion.div>
            )}

            <div className="flex items-center gap-3 mb-3 sm:mb-5">
              <motion.div
                animate={{ scale: activeStage === item.id ? 1.2 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className={`${
                  activeStage === item.id
                    ? "bg-[#3B2B13] text-[#FED649]"
                    : "bg-[#FED649]/60 text-[#3B2B13]"
                } font-bold rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-sm sm:text-base shadow-md`}
              >
                {item.id}
              </motion.div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-[#3B2B13]">
                {item.title}
              </h2>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true, amount: 0.4 }}
              className="text-base sm:text-lg lg:text-xl leading-relaxed max-w-xl text-[#4B3A1F] border-l-4 pl-5 py-2 border-[#3B2B13]/40 text-justify"
            >
              {item.description}
            </motion.p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ManufacturingProcess


