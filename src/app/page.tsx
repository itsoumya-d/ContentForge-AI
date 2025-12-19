"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MarketingNav, Footer } from "@/components/layout";
import {
  Sparkles,
  FileText,
  MessageSquare,
  Zap,
  Shield,
  Globe,
  ArrowRight,
  Check,
  Star,
  Layers,
  Cpu,
  MousePointer2
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Multimodal Intelligence",
    description: "Upload PDFs, high-res images, long audio clips, and 4K video. Gemini handles it all natively.",
    gradient: "from-blue-500 to-indigo-600"
  },
  {
    icon: Layers,
    title: "2M Context Window",
    description: "Stop chunking. Analyze entire books, legal libraries, or hour-long transcripts in one session.",
    gradient: "from-indigo-500 to-purple-600"
  },
  {
    icon: Zap,
    title: "AI Transformation",
    description: "Turn one blog post into 50 platform-optimized social posts, scripts, and summaries instantly.",
    gradient: "from-purple-500 to-pink-600"
  },
  {
    icon: MessageSquare,
    title: "Semantic Workspace",
    description: "Chat with your entire knowledge base. Get citations, insights, and cross-document analysis.",
    gradient: "from-pink-500 to-rose-600"
  },
  {
    icon: Cpu,
    title: "Code Execution",
    description: "Gemini can write and execute code on the fly to process complex data from your documents.",
    gradient: "from-rose-500 to-orange-600"
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Enterprise-grade encryption and SOC 2 compliant infrastructure. Your data is your own.",
    gradient: "from-orange-500 to-amber-600"
  },
];

const testimonials = [
  {
    quote: "ContentForge saved me 15 hours a week in content repurposing. The quality is indistinguishable from human work.",
    author: "Sarah Jenkins",
    role: "Marketing Director at FlowState",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
  },
  {
    quote: "The 2M token context is a game-changer. I analyzed a six-month research project in seconds.",
    author: "Dr. Marcus Chen",
    role: "Senior Researcher",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus"
  },
  {
    quote: "Finally, an AI tool that actually understands the nuances of multi-page documents and complex diagrams.",
    author: "Alex Rivera",
    role: "Product Manager",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
  }
];

export default function HomePage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950">
      <MarketingNav />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          {/* Animated Background Orbs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="flex-1 text-center lg:text-left space-y-8"
              >
                <Badge variant="outline" className="px-4 py-1.5 border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-medium animate-in fade-in slide-in-from-bottom-2 duration-1000">
                  <Sparkles className="mr-2 h-3.5 w-3.5" />
                  Experience the Future of Content Intelligence
                </Badge>

                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.1]">
                  Transform <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Complex Data</span> Into Content Gold
                </h1>

                <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  Stop settling for simple summaries. ContentForge leverages Gemini's 2M context window to analyze,
                  repurpose, and intelligently search through your entire knowledge base in seconds.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                  <Button size="lg" asChild className="h-14 px-8 text-lg bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 group">
                    <Link href="/signup">
                      Start Building for Free
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="h-14 px-8 text-lg border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all">
                    <Link href="#features">Explore Features</Link>
                  </Button>
                </div>

                <div className="flex items-center justify-center lg:justify-start gap-6 pt-6">
                  <div className="flex -space-x-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-10 w-10 rounded-full border-2 border-white dark:border-zinc-950 bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=User-${i}`} alt="user" />
                      </div>
                    ))}
                  </div>
                  <div className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                    <span className="text-zinc-900 dark:text-white font-bold">1,000+</span> teams building today
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.8 }}
                className="flex-1 relative w-full max-w-2xl"
              >
                <div className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
                    <div className="flex gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-red-400" />
                      <div className="h-3 w-3 rounded-full bg-amber-400" />
                      <div className="h-3 w-3 rounded-full bg-green-400" />
                    </div>
                    <div className="mx-auto text-xs text-zinc-400 font-mono">content-forge-v2.ai</div>
                  </div>

                  <div className="p-6 space-y-6">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50">
                      <FileText className="h-6 w-6 text-indigo-600 mt-1" />
                      <div>
                        <div className="text-sm font-semibold">Project_Report_Final.pdf</div>
                        <div className="text-xs text-zinc-500">Multimodal Analysis • 128 pages</div>
                      </div>
                      <Badge className="ml-auto bg-green-500/10 text-green-600 border-none">Ready</Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-end gap-3 justify-end">
                        <div className="px-4 py-2 rounded-2xl rounded-br-none bg-indigo-600 text-white text-sm">
                          Summarize the key findings and generate 3 LinkedIn posts.
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center p-1.5">
                          <Sparkles className="text-white h-full w-full" />
                        </div>
                        <div className="px-5 py-4 rounded-2xl rounded-tl-none bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm space-y-3 max-w-[85%]">
                          <p className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                            Analysis Complete
                          </p>
                          <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                            <div className="h-full w-[85%] bg-indigo-600 rounded-full" />
                          </div>
                          <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">
                            I've processed the 128-page report. Key findings: 12% revenue growth, efficiency gains in Phase 2...
                          </p>
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-[10px] py-0">LinkedIn v1</Badge>
                            <Badge variant="outline" className="text-[10px] py-0">Twitter Thread</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-6 -right-6 p-4 rounded-2xl bg-white dark:bg-zinc-900 shadow-xl border border-zinc-200 dark:border-zinc-800 rotate-6 hidden sm:block">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 p-2 rounded-lg"><Cpu className="h-5 w-5 text-orange-600" /></div>
                    <span className="text-sm font-bold">2M Context</span>
                  </div>
                </div>

                <div className="absolute -bottom-10 -left-10 p-5 rounded-2xl bg-white dark:bg-zinc-900 shadow-xl border border-zinc-200 dark:border-zinc-800 -rotate-3 hidden sm:block">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-8">
                      <span className="text-xs font-medium text-zinc-500 tracking-wider uppercase">Processing</span>
                      <MousePointer2 className="h-4 w-4 text-indigo-600 animate-bounce" />
                    </div>
                    <div className="h-1.5 w-32 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="h-full bg-indigo-600"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* LOGO CLOUD */}
        <section className="py-12 border-y border-zinc-100 dark:border-zinc-900 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-sm font-semibold text-zinc-400 mb-8 uppercase tracking-widest">Empowering Content Teams From</p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              <span className="text-xl font-bold tracking-tighter">FINTECH</span>
              <span className="text-xl font-bold tracking-tighter">NEXUS</span>
              <span className="text-xl font-bold tracking-tighter">AIRSTREAM</span>
              <span className="text-xl font-bold tracking-tighter">QUANTUM</span>
              <span className="text-xl font-bold tracking-tighter">STRIDE</span>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="py-24 lg:py-40 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-20 space-y-4">
              <h2 className="text-indigo-600 font-bold tracking-widest uppercase text-sm">Capabilities</h2>
              <h3 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Everything You Need to Scale Your Content Intelligence
              </h3>
              <p className="text-lg text-zinc-500">
                High-performance AI tools built for creators, marketers, and researchers.
              </p>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {features.map((feature, idx) => (
                <motion.div key={idx} variants={itemVariants}>
                  <Card className="group relative h-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 transition-all hover:border-indigo-500 dark:hover:border-indigo-500 overflow-hidden">
                    <div className={`absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-500 bg-gradient-to-br ${feature.gradient} rounded-full -mr-16 -mt-16`} />
                    <CardHeader>
                      <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-lg duration-300`}>
                        <feature.icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-xl font-bold group-hover:text-indigo-600 transition-colors">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                    <div className="absolute bottom-4 right-6 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all">
                      <ArrowRight className="h-5 w-5 text-indigo-600" />
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="py-24 bg-zinc-50 dark:bg-zinc-900/50 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 items-center gap-16">
              <div className="space-y-8">
                <h3 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white lg:text-5xl">
                  Loved by modern <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8">content teams</span>
                </h3>
                <p className="text-lg text-zinc-500 leading-relaxed">
                  Join hundreds of high-growth companies that use ContentForge to turn their proprietary data
                  into a strategic content asset.
                </p>
                <div className="flex items-center gap-8">
                  <div>
                    <div className="text-3xl font-bold text-zinc-900 dark:text-white">98%</div>
                    <div className="text-sm text-zinc-500">Satisfaction rate</div>
                  </div>
                  <div className="w-px h-12 bg-zinc-200 dark:bg-zinc-800" />
                  <div>
                    <div className="text-3xl font-bold text-zinc-900 dark:text-white">10M+</div>
                    <div className="text-sm text-zinc-500">Words transformed</div>
                  </div>
                </div>
              </div>

              <div className="grid gap-6">
                {testimonials.map((t, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4 hover:shadow-md transition-shadow"
                  >
                    <p className="text-zinc-600 dark:text-zinc-300 italic">"{t.quote}"</p>
                    <div className="flex items-center gap-4">
                      <img src={t.avatar} alt={t.author} className="h-10 w-10 rounded-full border border-zinc-100 dark:border-zinc-800" />
                      <div>
                        <div className="text-sm font-bold">{t.author}</div>
                        <div className="text-xs text-zinc-500">{t.role}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PRICING SECTION - COORDINATED WITH STRIPE */}
        <section id="pricing" className="py-24 lg:py-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20 space-y-4">
              <h3 className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white">Simple, Predictable Pricing</h3>
              <p className="text-lg text-zinc-500">Choose the plan that fits your content volume. Upgrade or downgrade anytime.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Free Plan */}
              <Card className="flex flex-col border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
                <CardHeader>
                  <CardTitle className="text-xl">Free</CardTitle>
                  <CardDescription>Perfect for trying the power of Gemini.</CardDescription>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold">$0</span>
                    <span className="text-zinc-500 text-sm">/mo</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <ul className="space-y-3">
                    {[
                      "5 Documents per month",
                      "Gemini 1.5 Flash analysis",
                      "Basic chat interface",
                      "Standard support"
                    ].map(f => (
                      <li key={f} className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                        <Check className="h-4 w-4 text-green-500" /> {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <div className="p-6 pt-0">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/signup">Current Plan</Link>
                  </Button>
                </div>
              </Card>

              {/* Starter Plan */}
              <Card className="flex flex-col border-indigo-500 shadow-xl shadow-indigo-500/10 bg-white dark:bg-zinc-900 scale-105 z-10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <Badge className="bg-indigo-600 text-white border-none py-1 px-4">Most Popular</Badge>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">Starter</CardTitle>
                  <CardDescription>Ideal for freelancers and creators.</CardDescription>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold">$19</span>
                    <span className="text-zinc-500 text-sm">/mo</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <ul className="space-y-3">
                    {[
                      "50 Documents per month",
                      "Fast Gemini 1.5 Flash",
                      "Multimodal analysis (Images/PDF)",
                      "Basic content transforms",
                      "Email support"
                    ].map(f => (
                      <li key={f} className="flex items-center gap-3 text-sm font-medium">
                        <Check className="h-4 w-4 text-indigo-500" /> {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <div className="p-6 pt-0">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-lg" asChild>
                    <Link href="/signup?plan=starter">Start Free Trial</Link>
                  </Button>
                </div>
              </Card>

              {/* Pro Plan */}
              <Card className="flex flex-col border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
                <CardHeader>
                  <CardTitle className="text-xl">Pro</CardTitle>
                  <CardDescription>For teams and power users.</CardDescription>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-bold">$49</span>
                    <span className="text-zinc-500 text-sm">/mo</span>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <ul className="space-y-3">
                    {[
                      "Unlimited Documents*",
                      "Gemini 1.5 Pro (High-precision)",
                      "Batch transformation",
                      "Custom brand voice",
                      "Priority support",
                      "Early access to features"
                    ].map(f => (
                      <li key={f} className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                        <Check className="h-4 w-4 text-green-500" /> {f}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <div className="p-6 pt-0">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/signup?plan=pro">Go Pro</Link>
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="py-24 bg-zinc-50 dark:bg-zinc-900/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h3 className="text-3xl font-bold tracking-tight">Frequently Asked Questions</h3>
            </div>
            <div className="grid gap-4">
              {[
                { q: "What is Gemini 1.5 Pro?", a: "It's Google's most advanced AI model, supporting a massive 2-million-token context window. This allows ContentForge to process extremely long documents, codebases, or video files with incredible accuracy." },
                { q: "Is my data used for training?", a: "No. ContentForge is built with enterprise privacy standards. We do not use your proprietary data or documents to train our models." },
                { q: "Can I cancel anytime?", a: "Yes, you can manage your subscription easily from the dashboard. If you cancel, you'll still have access until the end of your billing period." },
                { q: "Do you support custom templates?", a: "Yes! Our Pro and Business tiers allow you to create custom transformation pipelines and brand voice profiles to ensure output consistency." }
              ].map((faq, i) => (
                <Card key={i} className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                  <CardHeader className="py-5 px-6">
                    <CardTitle className="text-lg font-semibold">{faq.q}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-5">
                    <p className="text-zinc-500 dark:text-zinc-400">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-24 lg:py-40 relative overflow-hidden bg-indigo-600">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 opacity-50" />
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

          <div className="max-w-4xl mx-auto px-4 text-center relative z-10 space-y-8">
            <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">
              Build Your Content <br className="hidden md:block" /> Future Today.
            </h2>
            <p className="text-xl text-indigo-100/90 leading-relaxed max-w-2xl mx-auto">
              Don't get left behind in the manual content era. Scale your intelligence with the speed of Gemini.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
              <Button size="lg" asChild className="h-16 px-12 text-xl bg-white text-indigo-600 hover:bg-zinc-100 shadow-2xl transition-all hover:scale-105 active:scale-95">
                <Link href="/signup">Get Started for Free</Link>
              </Button>
              <Link href="/contact" className="text-white font-semibold hover:text-indigo-200 transition-colors py-2 px-4">
                Talk to Sales
              </Link>
            </div>
            <p className="text-indigo-200/60 text-sm">Join over 1,000+ creators and teams</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
