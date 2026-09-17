/** Live clock for the dashboard greeting, using tabular numerals to avoid layout shift. */
import { useEffect, useState, type ReactElement } from 'react';

function formatTime(now: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
    .format(now)
    .replace(':', '.')
    .toLowerCase();
}

function formatDate(now: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(now);
}

/** Greeting time and calendar date used by the hero and challenge widgets. */
export function useDashboardClock(): { time: string; date: string } {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  return { time: formatTime(now), date: formatDate(now) };
}

/** Large dashboard clock matching the reference’s 10.29 am treatment. */
export function GreetingClock(): ReactElement {
  const { time } = useDashboardClock();
  return (
    <p className="greeting-time" aria-live="polite">
      {time}
    </p>
  );
}
