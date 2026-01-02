
import { Timeline } from './hooks';

export function TimelineHeader({ timeline }: { timeline: Timeline }) {
  return (
    <div className="sticky top-0 z-10 bg-background h-10 flex border-b">
      {timeline.headers.primary.map((header) => (
        <div
          key={header.label}
          className="flex-shrink-0 border-r flex items-center justify-center"
          style={{ width: header.width }}
        >
          <span className="font-semibold text-sm">{header.label}</span>
        </div>
      ))}
      <div className="absolute top-5 h-5 w-full flex">
         {timeline.headers.secondary.map((header, i) => (
             <div
                key={`${header.label}-${i}`}
                className="flex-shrink-0 border-r flex items-center justify-center"
                style={{ width: header.width }}
            >
                <span className="text-xs text-muted-foreground">{header.label}</span>
            </div>
         ))}
      </div>
    </div>
  );
}
