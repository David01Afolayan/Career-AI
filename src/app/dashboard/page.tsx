import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import ProfileCompletion from "@/components/ProfileCompletion";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: {
      id: Number(session.user.id),
    },
    include: {
      student: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const profile = user.student;
  const totalResources = await db.learningResource.count();
  const completedProgress = profile
    ? await db.progress.count({
        where: {
          studentId: profile.id,
          status: "COMPLETED",
        },
      })
    : 0;
  const learningProgress =
    totalResources > 0
      ? Math.round((completedProgress / totalResources) * 100)
      : 0;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* NAVBAR */}
      <nav className="border-b border-slate-800 bg-slate-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold">
              Career<span className="text-blue-500">AI</span>
            </h1>

            <p className="text-xs text-slate-500">
              Career Guidance & Skill Recommendation
            </p>
          </div>

          <div className="flex items-center gap-4">
            {session.user.role === "ADMIN" && (
              <a
                href="/admin"
                className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950"
              >
                Admin Dashboard
              </a>
            )}

            <a
              href="/profile"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
            >
              My Profile
            </a>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">
                {user.name}
              </p>

              <p className="text-xs text-slate-500">
                {profile?.department || "Department not set"}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold">
              {user.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </nav>

      {/* CONTENT */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6">
          <ProfileCompletion />
        </div>

        {/* WELCOME */}
        <div className="mb-8">
          <p className="text-sm text-blue-400">
            STUDENT DASHBOARD
          </p>

          <h2 className="mt-2 text-3xl font-bold sm:text-4xl">
            Welcome back, {user.name?.split(" ")[0]} 👋
          </h2>

          <p className="mt-3 max-w-2xl text-slate-400">
            Discover the technology career that best matches your
            skills, interests and academic background.
          </p>
        </div>

        {/* STATS */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="CGPA"
            value={
              profile?.cgpa !== null && profile?.cgpa !== undefined
                ? profile.cgpa.toFixed(2)
                : "Not Set"
            }
            description="Academic performance"
            icon="🎓"
          />

          <StatCard
            title="Skills"
            value="0"
            description="Skills added"
            icon="🧠"
          />

          <StatCard
            title="Career Match"
            value="--"
            description="Complete assessment"
            icon="🎯"
          />

          <StatCard
            title="Learning Progress"
            value={`${learningProgress}%`}
            description="Overall progress"
            icon="📚"
            href="/progress"
            action="View Learning Progress"
          />
        </div>

        {/* MAIN GRID */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* CAREER RECOMMENDATION */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">
                  AI Career Recommendation
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Your recommended technology career will appear here.
                </p>
              </div>

              <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-400">
                AI
              </span>
            </div>

            <div className="mt-6 rounded-xl border border-dashed border-slate-700 p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 text-3xl">
                🎯
              </div>

              <h4 className="mt-4 text-lg font-semibold">
                Complete Your Assessment
              </h4>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
                Tell CareerAI about your technical skills,
                interests and experience so we can recommend
                suitable career paths.
              </p>

              <div className="mt-6 flex flex-col gap-3 rounded-2xl bg-blue-600/90 p-2 sm:flex-row sm:items-stretch">
                <a
                  href="/assessment"
                  className="inline-flex flex-1 items-center justify-center rounded-xl bg-transparent px-6 py-4 text-base font-semibold text-white transition hover:bg-white/5"
                >
                  Start Assessment
                </a>

                <a
                  href="/ai-result"
                  className="inline-flex flex-1 items-center justify-center rounded-xl bg-transparent px-5 py-4 text-base font-semibold text-white transition hover:bg-white/5"
                >
                  Get AI Career Recommendation
                </a>
              </div>
            </div>
          </div>

          {/* PROFILE */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="text-xl font-semibold">
              My Profile
            </h3>

            <div className="mt-6 space-y-5">
              <ProfileItem
                label="Name"
                value={user.name || "Not set"}
              />

              <ProfileItem
                label="Email"
                value={user.email}
              />

              <ProfileItem
                label="Department"
                value={profile?.department || "Not set"}
              />

              <ProfileItem
                label="Level"
                value={profile?.level?.toString() || "Not set"}
              />

              <ProfileItem
                label="Matric Number"
                value={
                  profile?.matricNumber || "Not set"
                }
              />
            </div>

            <button className="mt-6 w-full rounded-lg border border-slate-700 py-3 text-sm font-medium hover:bg-slate-800">
              Edit Profile
            </button>
          </div>
        </div>

        {/* SKILL GAP */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <DashboardCard
            icon="🧠"
            title="Skill Gap Analysis"
            description="Identify the skills you need to develop for your target career."
            button="Analyze My Skills"
            href="/skill-gap"
          />

          <DashboardCard
            icon="📚"
            title="Personalized Learning Roadmap"
            description="Get recommended courses, projects and resources based on your skill gaps."
            button="View Roadmap"
          />
        </div>

        {/* CAREER OPTIONS */}
        <div className="mt-8">
          <h3 className="text-2xl font-bold">
            Explore Technology Careers
          </h3>

          <p className="mt-2 text-slate-400">
            Explore career paths before completing your assessment.
          </p>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <CareerCard
              icon="💻"
              title="Frontend Developer"
              description="Build modern web interfaces."
            />

            <CareerCard
              icon="⚙️"
              title="Backend Developer"
              description="Build APIs and server-side systems."
            />

            <CareerCard
              icon="🤖"
              title="Machine Learning Engineer"
              description="Build intelligent software systems."
            />

            <CareerCard
              icon="🔐"
              title="Cybersecurity Analyst"
              description="Protect systems and digital information."
            />
          </div>
        </div>
      </section>
    </main>
  );
}

/* COMPONENTS */

function StatCard({
  title,
  value,
  description,
  icon,
  href,
  action,
}: {
  title: string;
  value: string;
  description: string;
  icon: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>

        <span className="text-xs text-slate-500">
          CareerAI
        </span>
      </div>

      <p className="mt-5 text-sm text-slate-400">
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>

      {href && action && (
        <a
          href={href}
          className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          {action}
        </a>
      )}

    </div>
  );
}

function ProfileItem({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 break-words text-sm text-slate-200">
        {value || "Not set"}
      </p>
    </div>
  );
}

function DashboardCard({
  icon,
  title,
  description,
  button,
  href,
}: {
  icon: string;
  title: string;
  description: string;
  button: string;
  href?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-2xl">
        {icon}
      </div>

      <h3 className="mt-5 text-xl font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-400">
        {description}
      </p>

      {href ? (
        <Link
          href={href}
          className="mt-5 inline-flex rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-medium hover:bg-slate-800"
        >
          {button}
        </Link>
      ) : (
        <button className="mt-5 rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-medium hover:bg-slate-800">
          {button}
        </button>
      )}
    </div>
  );
}

function CareerCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:-translate-y-1 hover:border-blue-500/50">
      <div className="text-3xl">{icon}</div>

      <h4 className="mt-4 font-semibold">
        {title}
      </h4>

      <p className="mt-2 text-sm text-slate-400">
        {description}
      </p>

      <a
        href="/careers"
        className="mt-4 inline-block text-sm font-medium text-blue-400 hover:text-blue-300"
      >
        View Career Matches →
      </a>
    </div>
  );
}