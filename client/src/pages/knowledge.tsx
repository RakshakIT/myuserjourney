import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  GraduationCap,
  Award,
  Trophy,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  BarChart3,
  Route,
  Search,
  Shield,
  Megaphone,
  BrainCircuit,
  Star,
  Flame,
  Gem,
  Crown,
  Rocket,
  ShieldCheck,
  BookOpen,
} from "lucide-react";
import { useLocation } from "wouter";
import type { QuizTopic, Badge as BadgeType } from "@shared/schema";

const iconMap: Record<string, any> = {
  "bar-chart-3": BarChart3,
  "route": Route,
  "search": Search,
  "shield": Shield,
  "megaphone": Megaphone,
  "brain-circuit": BrainCircuit,
  "award": Award,
  "trophy": Trophy,
  "star": Star,
  "flame": Flame,
  "gem": Gem,
  "crown": Crown,
  "rocket": Rocket,
  "shield-check": ShieldCheck,
  "book": BookOpen,
};

function getIcon(name: string) {
  return iconMap[name] || BookOpen;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  difficulty: string;
  sortOrder: number;
}

interface QuizResult {
  score: number;
  correct: number;
  total: number;
  results: {
    questionId: string;
    correct: boolean;
    correctAnswer: number;
    userAnswer: number;
    explanation: string | null;
  }[];
  newBadges: BadgeType[];
}

type ViewState =
  | { type: "topics" }
  | { type: "quiz"; topic: QuizTopic }
  | { type: "results"; topic: QuizTopic; result: QuizResult; questions: QuizQuestion[] };

export default function KnowledgeCenterPage() {
  const [view, setView] = useState<ViewState>({ type: "topics" });
  const initialTab = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("tab") === "badges" ? "badges" : "quizzes";
  const [tab, setTab] = useState<"quizzes" | "badges">(initialTab);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const { data: topics = [] } = useQuery<QuizTopic[]>({ queryKey: ["/api/quiz/topics"] });
  const { data: attempts = [] } = useQuery<any[]>({ queryKey: ["/api/quiz/attempts"] });
  const { data: allBadges = [] } = useQuery<BadgeType[]>({ queryKey: ["/api/badges"] });
  const { data: myBadges = [] } = useQuery<any[]>({ queryKey: ["/api/badges/mine"] });

  const submitMutation = useMutation({
    mutationFn: async (data: { topicId: string; answers: (number | undefined)[] }) => {
      const res = await apiRequest("POST", "/api/quiz/submit", data);
      return res.json();
    },
    onSuccess: (result: QuizResult) => {
      if (view.type === "quiz") {
        const topicId = view.topic.id;
        queryClient.invalidateQueries({ queryKey: ["/api/quiz/attempts"] });
        queryClient.invalidateQueries({ queryKey: ["/api/badges/mine"] });
        setView({
          type: "results",
          topic: view.topic,
          result,
          questions: questionsData || [],
        });
      }
    },
  });

  const topicId = view.type === "quiz" || view.type === "results" ? view.topic.id : null;
  const { data: questionsData } = useQuery<QuizQuestion[]>({
    queryKey: ["/api/quiz/topics", topicId, "questions"],
    enabled: !!topicId,
  });

  const getTopicBestScore = (tId: string) => {
    const topicAttempts = attempts.filter((a: any) => a.topicId === tId);
    if (topicAttempts.length === 0) return null;
    return Math.max(...topicAttempts.map((a: any) => a.score));
  };

  const getTopicAttemptCount = (tId: string) => {
    return attempts.filter((a: any) => a.topicId === tId).length;
  };

  const handleStartQuiz = (topic: QuizTopic) => {
    setAnswers({});
    setCurrentQuestion(0);
    setView({ type: "quiz", topic });
  };

  const handleSubmit = () => {
    if (view.type !== "quiz" || !questionsData) return;
    const answerArray = questionsData.map((_, i) => answers[i] ?? -1);
    submitMutation.mutate({ topicId: view.topic.id, answers: answerArray });
  };

  const totalAttempts = attempts.length;
  const uniqueTopicsPassed = new Set(attempts.filter((a: any) => a.score >= 60).map((a: any) => a.topicId)).size;
  const earnedBadgeIds = new Set(myBadges.map((b: any) => b.badgeId));

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" data-testid="text-knowledge-title">
            <GraduationCap className="h-7 w-7 text-primary" />
            Knowledge Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Test your analytics knowledge and earn badges
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={tab === "quizzes" ? "default" : "outline"}
            onClick={() => setTab("quizzes")}
            data-testid="button-tab-quizzes"
          >
            <GraduationCap className="h-4 w-4 mr-2" />
            Quizzes
          </Button>
          <Button
            variant={tab === "badges" ? "default" : "outline"}
            onClick={() => setTab("badges")}
            data-testid="button-tab-badges"
          >
            <Award className="h-4 w-4 mr-2" />
            Badges ({myBadges.length}/{allBadges.length})
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold" data-testid="text-total-attempts">{totalAttempts}</p>
              <p className="text-xs text-muted-foreground">Quizzes Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold" data-testid="text-topics-passed">{uniqueTopicsPassed}/{topics.length}</p>
              <p className="text-xs text-muted-foreground">Topics Passed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Award className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold" data-testid="text-badges-earned">{myBadges.length}</p>
              <p className="text-xs text-muted-foreground">Badges Earned</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {tab === "quizzes" && view.type === "topics" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.map((topic) => {
            const Icon = getIcon(topic.icon);
            const bestScore = getTopicBestScore(topic.id);
            const attemptCount = getTopicAttemptCount(topic.id);
            const passed = bestScore !== null && bestScore >= 60;

            return (
              <Card key={topic.id} className="hover-elevate cursor-pointer" data-testid={`card-topic-${topic.id}`}>
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className="h-12 w-12 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${topic.color}15` }}
                    >
                      <Icon className="h-6 w-6" style={{ color: topic.color }} />
                    </div>
                    {passed && (
                      <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Passed
                      </Badge>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-base">{topic.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{topic.description}</p>
                  </div>
                  <div className="space-y-2">
                    {bestScore !== null && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Best Score</span>
                          <span className="font-medium">{bestScore}%</span>
                        </div>
                        <Progress value={bestScore} className="h-1.5" />
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {attemptCount > 0 ? `${attemptCount} attempt${attemptCount > 1 ? "s" : ""}` : "Not attempted"}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => handleStartQuiz(topic)}
                        data-testid={`button-start-quiz-${topic.id}`}
                      >
                        {attemptCount > 0 ? "Retake" : "Start"}
                        <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {tab === "quizzes" && view.type === "quiz" && questionsData && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setView({ type: "topics" })}
                data-testid="button-back-topics"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="text-lg">{view.topic.name}</CardTitle>
            </div>
            <Badge variant="outline">
              Question {currentQuestion + 1} of {questionsData.length}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            <Progress value={((currentQuestion + 1) / questionsData.length) * 100} className="h-2" />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {questionsData[currentQuestion].difficulty}
                </Badge>
              </div>
              <h3 className="text-lg font-medium" data-testid="text-question">
                {questionsData[currentQuestion].question}
              </h3>
              <div className="grid gap-2">
                {questionsData[currentQuestion].options.map((option, idx) => {
                  const isSelected = answers[currentQuestion] === idx;
                  return (
                    <Button
                      key={idx}
                      variant={isSelected ? "default" : "outline"}
                      className="justify-start text-left h-auto py-3 px-4"
                      onClick={() => setAnswers({ ...answers, [currentQuestion]: idx })}
                      data-testid={`button-option-${idx}`}
                    >
                      <span className="mr-3 shrink-0 h-6 w-6 rounded-full border flex items-center justify-center text-xs font-medium">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-sm">{option}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
                data-testid="button-prev-question"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              {currentQuestion < questionsData.length - 1 ? (
                <Button
                  onClick={() => setCurrentQuestion(currentQuestion + 1)}
                  disabled={answers[currentQuestion] === undefined}
                  data-testid="button-next-question"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={Object.keys(answers).length < questionsData.length || submitMutation.isPending}
                  data-testid="button-submit-quiz"
                >
                  {submitMutation.isPending ? "Submitting..." : "Submit Quiz"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {tab === "quizzes" && view.type === "results" && (
        <div className="space-y-6">
          {view.result.newBadges.length > 0 && (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="h-5 w-5 text-amber-500" />
                  <h3 className="font-semibold">New Badge{view.result.newBadges.length > 1 ? "s" : ""} Earned!</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {view.result.newBadges.map((badge) => {
                    const Icon = getIcon(badge.icon);
                    return (
                      <div
                        key={badge.id}
                        className="flex items-center gap-2 rounded-lg p-3 bg-background border"
                      >
                        <div
                          className="h-8 w-8 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: `${badge.color}20` }}
                        >
                          <Icon className="h-4 w-4" style={{ color: badge.color }} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{badge.name}</p>
                          <p className="text-xs text-muted-foreground">{badge.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2">
              <CardTitle className="text-lg">Quiz Results: {view.topic.name}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge
                  variant="default"
                  className={view.result.score >= 60 ? "bg-green-500" : "bg-red-500"}
                >
                  {view.result.score}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{view.result.correct}</p>
                  <p className="text-xs text-muted-foreground">Correct</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{view.result.total - view.result.correct}</p>
                  <p className="text-xs text-muted-foreground">Incorrect</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{view.result.score}%</p>
                  <p className="text-xs text-muted-foreground">Score</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {view.result.results.map((r, idx) => {
                  const q = view.questions[idx];
                  if (!q) return null;
                  return (
                    <div
                      key={r.questionId}
                      className={`rounded-lg border p-4 space-y-2 ${r.correct ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"}`}
                      data-testid={`result-question-${idx}`}
                    >
                      <div className="flex items-start gap-2">
                        {r.correct ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                        )}
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{q.question}</p>
                          {!r.correct && (
                            <p className="text-xs text-muted-foreground">
                              Your answer: <span className="text-red-500">{q.options[r.userAnswer] || "Not answered"}</span>
                              {" | "}
                              Correct: <span className="text-green-500">{q.options[r.correctAnswer]}</span>
                            </p>
                          )}
                          {r.explanation && (
                            <p className="text-xs text-muted-foreground italic">{r.explanation}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setView({ type: "topics" })} data-testid="button-back-all-topics">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  All Topics
                </Button>
                <Button onClick={() => handleStartQuiz(view.topic)} data-testid="button-retake-quiz">
                  Retake Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "badges" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allBadges.map((badge) => {
            const Icon = getIcon(badge.icon);
            const earned = earnedBadgeIds.has(badge.id);
            const earnedBadge = myBadges.find((b: any) => b.badgeId === badge.id);

            return (
              <Card
                key={badge.id}
                className={earned ? "" : "opacity-50"}
                data-testid={`card-badge-${badge.id}`}
              >
                <CardContent className="p-5 flex items-start gap-4">
                  <div
                    className={`h-14 w-14 rounded-full flex items-center justify-center shrink-0 ${earned ? "" : "grayscale"}`}
                    style={{ backgroundColor: `${badge.color}15` }}
                  >
                    <Icon className="h-7 w-7" style={{ color: earned ? badge.color : "currentColor" }} />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm">{badge.name}</h3>
                      {earned && (
                        <Badge variant="default" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-xs">
                          Earned
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                    <p className="text-xs text-muted-foreground italic">{badge.requirement}</p>
                    {earned && earnedBadge && (
                      <p className="text-xs text-muted-foreground">
                        Earned {new Date(earnedBadge.earnedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
