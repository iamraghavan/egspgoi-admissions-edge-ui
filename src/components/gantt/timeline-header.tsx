
import { Timeline } from './hooks';

export function TimelineHeader({ timeline }: { timeline: Timeline }) {
  return (
    <div className="sticky top-0 z-10 bg-background flex flex-col">
      <div className="flex border-b">
        {timeline.headers.primary.map((header, i) => (
          <div
            key={`${header.label}-${i}`}
            className="flex-shrink-0 border-r flex items-center justify-center h-8"
            style={{ width: header.width }}
          >
            <span className="font-semibold text-xs text-muted-foreground">{header.label}</span>
          </div>
        ))}
      </div>
       <div className="flex border-b">
         {timeline.headers.secondary.map((header, i) => (
             <div
                key={`${header.label}-${i}`}
                className="flex-shrink-0 border-r flex items-center justify-center h-8"
                style={{ width: header.width }}
            >
                <span className="text-xs text-muted-foreground">{header.label}</span>
            </div>
         ))}
      </div>
    </div>
  );
}
