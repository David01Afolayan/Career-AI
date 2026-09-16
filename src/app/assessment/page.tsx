"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Question = {
  id: string;
  question: string;
  options: unknown;
  difficulty: string;
  skill: { id: number; name: string; category: string };
};

export default function AssessmentPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadQuestions() {
      try {
        const response = await fetch("/api/assessment/questions");
        const data = await response.json();
        if (!response.ok) {
          setError(data.error || "Unable to load assessment.");
          return;
        }
        setQuestions(data.questions || []);
      } catch {
        setError("Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    }
    loadQuestions();
  }, []);

  const currentQuestion = questions[currentIndex];
  const options = currentQuestion && Array.isArray(currentQuestion.options)
    ? currentQuestion.options.map(String)
    : [];
  const selectedAnswer = currentQuestion
    ? answers[currentQuestion.id]
    : undefined;

  function selectAnswer(optionIndex: number) {
    if (!currentQuestion) return;
    setAnswers((previous) => ({ ...previous, [currentQuestion.id]: optionIndex }));
    setError("");
  }

  function handleNext() {
    if (selectedAnswer === undefined) {
      setError("Please select an answer before continuing.");
      return;
    }
    setError("");
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((previous) => previous + 1);
    }
  }

  function handlePrevious() {
    setError("");
    if (currentIndex > 0) setCurrentIndex((previous) => previous - 1);
  }

  async function handleSubmit() {
    if (selectedAnswer === undefined) {
      setError("Please select an answer before submitting.");
      return;
    }
    if (Object.keys(answers).length !== questions.length) {
      setError("Please answer all questions before submitting.");
      return;
    }
    if (!window.confirm("Are you sure you want to submit your assessment? You will not be able to change your answers.")) return;

    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/assessment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: questions.map((question) => ({
            questionId: question.id,
            selectedAnswer: answers[question.id],
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Unable to submit assessment.");
        return;
      }
      router.push(`/assessment/result?assessmentId=${data.assessmentId}`);
    } catch {
      setError("Something went wrong while submitting your assessment.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <main className="min-h-screen bg-slate-950 px-6 py-16 text-center text-white"><div className="text-4xl">🧠</div><h1 className="mt-4 text-2xl font-bold">Loading Career Assessment...</h1><p className="mt-2 text-slate-400">Preparing your questions.</p></main>;
  }

  if (error && questions.length === 0) {
    return <main className="min-h-screen bg-slate-950 px-6 py-16 text-white"><div className="mx-auto max-w-xl rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center"><h1 className="text-2xl font-bold">Unable to Load Assessment</h1><p className="mt-3 text-red-300">{error}</p><button onClick={() => window.location.reload()} className="mt-6 rounded-lg bg-white px-5 py-3 font-semibold text-slate-900">Try Again</button></div></main>;
  }

  if (!currentQuestion) {
    return <main className="min-h-screen bg-slate-950 px-6 py-16 text-center text-white"><h1 className="text-2xl font-bold">No Assessment Questions Found</h1><p className="mt-3 text-slate-400">Please seed the assessment questions first.</p></main>;
  }

  const progress = Math.round(((currentIndex + 1) / questions.length) * 100);
  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">CareerAI Assessment</p>
              <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Discover Your Technical Strengths</h1>
              <p className="mt-2 text-slate-400">Answer the questions based on your current knowledge.</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900 px-5 py-3 text-center"><p className="text-xs text-slate-400">Question</p><p className="text-xl font-bold">{currentIndex + 1} / {questions.length}</p></div>
          </div>
          <div className="mt-6"><div className="mb-2 flex justify-between text-sm"><span className="text-slate-400">Assessment Progress</span><span className="font-semibold text-blue-400">{progress}%</span></div><div className="h-3 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${progress}%` }} /></div></div>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl sm:p-8">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-blue-500/10 px-3 py-1 text-sm font-semibold text-blue-400">{currentQuestion.skill.name}</span>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">{currentQuestion.skill.category}</span>
            <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">{currentQuestion.difficulty}</span>
          </div>
          <h2 className="text-xl font-semibold leading-relaxed sm:text-2xl">{currentQuestion.question}</h2>
          <div className="mt-8 space-y-4">
            {options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              return <button key={index} type="button" onClick={() => selectAnswer(index)} className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition ${isSelected ? "border-blue-500 bg-blue-500/10" : "border-slate-700 bg-slate-950 hover:border-slate-500 hover:bg-slate-800"}`}><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border font-semibold ${isSelected ? "border-blue-500 bg-blue-500 text-white" : "border-slate-600 text-slate-300"}`}>{String.fromCharCode(65 + index)}</span><span className={isSelected ? "font-semibold text-white" : "text-slate-300"}>{option}</span></button>;
            })}
          </div>
          {error && <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button type="button" onClick={handlePrevious} disabled={currentIndex === 0 || submitting} className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40">← Previous</button>
            {!isLastQuestion ? <button type="button" onClick={handleNext} disabled={submitting} className="rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500 disabled:opacity-50">Next →</button> : <button type="button" onClick={handleSubmit} disabled={submitting} className="rounded-xl bg-green-600 px-6 py-3 font-semibold hover:bg-green-500 disabled:opacity-50">{submitting ? "Submitting..." : "Submit Assessment ✓"}</button>}
          </div>
        </section>
        <div className="mt-6 text-center text-sm text-slate-500">Your answers are used to estimate your current technical proficiency and improve your career recommendations.</div>
      </div>
    </main>
  );
}
