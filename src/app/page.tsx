import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-2xl font-bold">
            Career<span className="text-blue-400">AI</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm text-slate-300 hover:text-white"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold hover:bg-blue-500"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex rounded-full border border-blue-400/30 bg-blue-400/10 px-4 py-2 text-sm text-blue-300">
            AI-Powered Career Guidance
          </div>

          <h1 className="text-5xl font-bold leading-tight md:text-7xl">
            Discover the
            <span className="block text-blue-400">
              right tech career
            </span>
            for you.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            CareerAI analyzes your skills, academic background, interests,
            projects, and experience to recommend suitable technology careers
            and identify the skills you need to develop.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/register"
              className="rounded-xl bg-blue-600 px-7 py-3.5 font-semibold transition hover:bg-blue-500"
            >
              Start Your Assessment
            </Link>

            <Link
              href="#how-it-works"
              className="rounded-xl border border-white/10 px-7 py-3.5 font-semibold text-slate-300 transition hover:bg-white/5"
            >
              How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="border-t border-white/10 bg-slate-900/50 px-6 py-20"
      >
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
              How it works
            </p>

            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              From skills to career direction
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {[
              {
                number: "01",
                title: "Build Your Profile",
                description:
                  "Tell us about your academic background, skills, projects, and interests.",
              },
              {
                number: "02",
                title: "Take Assessment",
                description:
                  "Complete a short assessment covering your technical abilities and career interests.",
              },
              {
                number: "03",
                title: "Get AI Recommendations",
                description:
                  "Our machine-learning system analyzes your profile and recommends suitable careers.",
              },
              {
                number: "04",
                title: "Build Your Roadmap",
                description:
                  "Identify your skill gaps and follow a personalized learning roadmap.",
              },
            ].map((item) => (
              <div
                key={item.number}
                className="rounded-2xl border border-white/10 bg-slate-900 p-6"
              >
                <span className="text-sm font-bold text-blue-400">
                  {item.number}
                </span>

                <h3 className="mt-4 text-xl font-semibold">
                  {item.title}
                </h3>

                <p className="mt-3 leading-7 text-slate-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl rounded-3xl border border-blue-400/20 bg-blue-500/10 p-10 text-center">
          <h2 className="text-3xl font-bold">
            Ready to discover your career path?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-slate-400">
            Complete your profile and let CareerAI help you understand where
            your current skills can take you.
          </p>

          <Link
            href="/register"
            className="mt-8 inline-block rounded-xl bg-blue-600 px-7 py-3.5 font-semibold hover:bg-blue-500"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 text-sm text-slate-500 md:flex-row">
          <p>© 2026 CareerAI</p>
          <p>AI-Powered Career Guidance System</p>
        </div>
      </footer>
    </main>
  );
}