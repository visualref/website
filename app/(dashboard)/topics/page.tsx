"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Clock,
  CheckCircle2,
  Eye,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useTopics, useUpdateTopic, useGenerateContent } from "@/hooks/use-api";
import type { Topic, CalendarBlogStatus } from "@/types";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  parseISO,
} from "date-fns";

// Map backend topic status to calendar status
function mapTopicStatus(status: string): CalendarBlogStatus {
  switch (status) {
    case "completed":
    case "published":
      return "published";
    case "processing":
    case "generating":
      return "generating";
    case "in_review":
    case "review":
    case "REVIEW":
      return "in_review";
    case "failed":
      return "failed";
    case "new":
      return "new";
    case "scheduled":
    default:
      return "scheduled";
  }
}

// Status configuration
const STATUS_CONFIG: Record<
  CalendarBlogStatus,
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    dot: string;
    icon: React.ElementType;
    pulse?: boolean;
  }
> = {
  published: {
    label: "Published",
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    dot: "bg-emerald-500",
    icon: CheckCircle2,
  },
  scheduled: {
    label: "Scheduled",
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
    dot: "bg-blue-500",
    icon: Clock,
  },
  generating: {
    label: "Generating",
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
    dot: "bg-amber-500",
    icon: Sparkles,
    pulse: true,
  },
  in_review: {
    label: "In Review",
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    border: "border-orange-500/20",
    dot: "bg-orange-500",
    icon: Eye,
  },
  new: {
    label: "New",
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/20",
    dot: "bg-purple-500",
    icon: Sparkles,
  },
  failed: {
    label: "Failed",
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/20",
    dot: "bg-red-500",
    icon: Clock,
  },
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Represents a topic mapped for calendar display
interface CalendarEntry {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  status: CalendarBlogStatus;
  topicId: string;
  contentItemId?: string;
}

function BlogPill({ entry }: { entry: CalendarEntry }) {
  const router = useRouter();
  const config = STATUS_CONFIG[entry.status];
  const Icon = config.icon;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Navigate to topic detail or content page
    if (entry.contentItemId) {
      router.push(`/content/${entry.contentItemId}`);
    } else {
      toast.info("This topic hasn't been generated yet.");
    }
  };

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleClick}
            className={cn(
              "w-full text-left px-2 py-1.5 rounded-md text-xs font-medium truncate",
              "border transition-all duration-200 cursor-pointer",
              "hover:scale-[1.02] hover:shadow-md",
              config.bg,
              config.text,
              config.border,
              config.pulse && "animate-pulse"
            )}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full shrink-0",
                  config.dot
                )}
              />
              <span className="truncate">{entry.title}</span>
            </div>
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="bg-card border-border shadow-xl max-w-[280px]"
        >
          <div className="space-y-2">
            <p className="font-semibold text-sm text-foreground">
              {entry.title}
            </p>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                  config.bg,
                  config.text
                )}
              >
                <Icon className="w-3 h-3" />
                {config.label}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {format(parseISO(entry.date), "EEEE, MMMM d, yyyy")}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function StatusLegend() {
  return (
    <div className="flex items-center gap-4 flex-wrap">
      {Object.entries(STATUS_CONFIG).map(([key, config]) => {
        const Icon = config.icon;
        return (
          <div key={key} className="flex items-center gap-1.5 text-xs">
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                config.dot
              )}
            />
            <Icon className={cn("w-3 h-3", config.text)} />
            <span className="text-muted-foreground font-medium">
              {config.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function EditTopicForm({ entry, onClose }: { entry: CalendarEntry; onClose: () => void }) {
  const { mutate: updateTopic, isPending } = useUpdateTopic();
  const { mutate: generateBlog, isPending: isGenerating } = useGenerateContent();
  const [title, setTitle] = useState(entry.title);
  const [dateStr, setDateStr] = useState(entry.date);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTopic(
      { 
        id: entry.topicId, 
        payload: { 
          title, 
          createdAt: dateStr ? new Date(dateStr).toISOString() : undefined 
        } 
      },
      { onSuccess: onClose }
    );
  };

  const handleGenerateClick = () => {
    generateBlog(entry.topicId, { onSuccess: onClose });
  };

  const canGenerate = entry.status === "scheduled" || entry.status === "new" || entry.status === "failed";

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border p-3 rounded-lg mb-3 last:mb-0">
      <div>
        <Label>Title</Label>
        <Input 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          className="mt-1"
        />
      </div>
      <div>
        <Label>Scheduled Date</Label>
        <Input 
          type="date" 
          value={dateStr} 
          onChange={(e) => setDateStr(e.target.value)} 
          className="mt-1"
        />
      </div>
      <div className="flex items-center justify-between pt-1">
        <div>
          {canGenerate && (
            <Button 
              size="sm" 
              type="button" 
              variant="secondary" 
              onClick={handleGenerateClick}
              disabled={isGenerating || isPending}
            >
              {isGenerating ? "Triggering..." : "Generate Blog"}
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button size="sm" type="button" variant="ghost" onClick={onClose} disabled={isGenerating || isPending}>Cancel</Button>
          <Button size="sm" type="submit" disabled={isGenerating || isPending}>{isPending ? "Saving..." : "Save"}</Button>
        </div>
      </div>
    </form>
  );
}

export default function ContentCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDayClick = (day: Date) => {
    setSelectedDate(day);
    setIsModalOpen(true);
  };

  // Fetch topics from API
  const { data: topicsData, isLoading } = useTopics({ limit: 100 });

  // Map topics to calendar entries
  const calendarEntries: CalendarEntry[] = useMemo(() => {
    const topics = topicsData?.data || [];
    return topics.map((topic: Topic) => ({
      id: topic.id,
      title: topic.title,
      date: topic.createdAt
        ? topic.createdAt.substring(0, 10)
        : "",
      status: mapTopicStatus(topic.status),
      topicId: topic.id,
      contentItemId: topic.contentItemId,
    }));
  }, [topicsData]);

  // Build the calendar grid
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  // Group entries by date
  const entriesByDate = useMemo(() => {
    const map: Record<string, CalendarEntry[]> = {};
    for (const entry of calendarEntries) {
      if (!entry.date) continue;
      if (!map[entry.date]) map[entry.date] = [];
      map[entry.date].push(entry);
    }
    return map;
  }, [calendarEntries]);

  // Stats for current month
  const monthEntries = useMemo(
    () =>
      calendarEntries.filter(
        (e) => e.date && isSameMonth(parseISO(e.date), currentMonth)
      ),
    [calendarEntries, currentMonth]
  );

  const stats = useMemo(() => {
    const s: Record<CalendarBlogStatus, number> = { scheduled: 0, generating: 0, in_review: 0, published: 0, new: 0, failed: 0 };
    for (const e of monthEntries) {
      s[e.status]++;
    }
    return s;
  }, [monthEntries]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Content Calendar
          </h1>
          <p className="text-muted-foreground mt-1">
            Your automated blog schedule — topics are generated and published
            automatically.
          </p>
        </div>

        {/* Month Stats */}
        <div className="flex items-center gap-3">
          {Object.entries(stats).map(([status, count]) => {
            const config = STATUS_CONFIG[status as CalendarBlogStatus];
            return (
              <div
                key={status}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium",
                  config.bg,
                  config.text,
                  config.border
                )}
              >
                <span className={cn("w-2 h-2 rounded-full", config.dot)} />
                {count}
              </div>
            );
          })}
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="flex items-center justify-between bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-bold min-w-[200px] text-center">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-primary"
            onClick={() => setCurrentMonth(new Date())}
          >
            Today
          </Button>
        </div>

        <StatusLegend />
      </div>

      {/* Calendar Grid */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Loading calendar...
              </p>
            </div>
          </div>
        ) : (
          /* Day Cells */
          <div className="grid grid-cols-7">
            {calendarDays.map((day, idx) => {
              const dateKey = format(day, "yyyy-MM-dd");
              const dayEntries = entriesByDate[dateKey] || [];
              const inMonth = isSameMonth(day, currentMonth);
              const today = isToday(day);

              return (
                <div
                  key={idx}
                  onClick={() => handleDayClick(day)}
                  className={cn(
                    "min-h-[120px] border-b border-r border-border p-2 transition-colors cursor-pointer hover:bg-accent/40",
                    !inMonth && "bg-accent/20",
                    today && "bg-primary/[0.03]",
                    (idx + 1) % 7 === 0 && "border-r-0"
                  )}
                >
                  {/* Day Number */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={cn(
                        "text-sm font-medium",
                        !inMonth && "text-muted-foreground/40",
                        inMonth && "text-muted-foreground",
                        today &&
                          "bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                    {today && (
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                        Today
                      </span>
                    )}
                  </div>

                  {/* Blog Pills */}
                  <div className="space-y-1">
                    {dayEntries.slice(0, 2).map((entry) => (
                      <BlogPill key={entry.id} entry={entry} />
                    ))}
                    {dayEntries.length > 2 && (
                      <p className="text-[10px] text-muted-foreground font-medium pl-2">
                        +{dayEntries.length - 2} more
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Date Clicking Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Topics for {selectedDate ? format(selectedDate, "MMMM d, yyyy") : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto pr-2">
            {selectedDate && (entriesByDate[format(selectedDate, "yyyy-MM-dd")] || []).map(entry => (
              <EditTopicForm key={entry.id} entry={entry} onClose={() => setIsModalOpen(false)} />
            ))}
            {selectedDate && (entriesByDate[format(selectedDate, "yyyy-MM-dd")] || []).length === 0 && (
              <p className="text-muted-foreground text-sm py-4 text-center">
                No topics scheduled for this date.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
