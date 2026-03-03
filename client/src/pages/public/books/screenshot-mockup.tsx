interface MockupProps {
  title: string;
  children: React.ReactNode;
}

export function ScreenshotMockup({ title, children }: MockupProps) {
  return (
    <div className="my-6 rounded-lg border border-border/60 shadow-md overflow-hidden bg-card">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/50 border-b border-border/40">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-400/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
          <div className="w-3 h-3 rounded-full bg-green-400/70" />
        </div>
        <div className="flex-1 text-center">
          <span className="text-xs text-muted-foreground font-medium">{title}</span>
        </div>
      </div>
      <div className="p-4 space-y-3">
        {children}
      </div>
    </div>
  );
}

export function MockMetricCard({ label, value, trend }: { label: string; value: string; trend?: string }) {
  return (
    <div className="rounded-md border border-border/40 p-3 bg-background">
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="text-lg font-bold">{value}</div>
      {trend && <div className="text-xs text-green-600 dark:text-green-400 mt-0.5">{trend}</div>}
    </div>
  );
}

export function MockChart({ height = "h-32", label }: { height?: string; label?: string }) {
  return (
    <div className={`${height} rounded-md bg-gradient-to-t from-primary/20 to-primary/5 border border-border/30 flex items-end justify-center gap-1 p-3`}>
      <div className="w-6 bg-primary/40 rounded-t" style={{ height: "30%" }} />
      <div className="w-6 bg-primary/50 rounded-t" style={{ height: "55%" }} />
      <div className="w-6 bg-primary/60 rounded-t" style={{ height: "70%" }} />
      <div className="w-6 bg-primary/70 rounded-t" style={{ height: "45%" }} />
      <div className="w-6 bg-primary/80 rounded-t" style={{ height: "85%" }} />
      <div className="w-6 bg-primary/60 rounded-t" style={{ height: "60%" }} />
      <div className="w-6 bg-primary/50 rounded-t" style={{ height: "40%" }} />
      <div className="w-6 bg-primary/70 rounded-t" style={{ height: "75%" }} />
      {label && <span className="text-[10px] text-muted-foreground absolute bottom-1 right-3">{label}</span>}
    </div>
  );
}

export function MockTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="rounded-md border border-border/40 overflow-hidden text-xs">
      <div className="grid bg-muted/50 font-medium text-muted-foreground" style={{ gridTemplateColumns: `repeat(${headers.length}, 1fr)` }}>
        {headers.map((h, i) => <div key={i} className="px-3 py-2 border-b border-border/30">{h}</div>)}
      </div>
      {rows.map((row, ri) => (
        <div key={ri} className="grid border-b border-border/20 last:border-0" style={{ gridTemplateColumns: `repeat(${headers.length}, 1fr)` }}>
          {row.map((cell, ci) => <div key={ci} className="px-3 py-2">{cell}</div>)}
        </div>
      ))}
    </div>
  );
}

export function MockSidebar({ items, active }: { items: string[]; active?: string }) {
  return (
    <div className="rounded-md border border-border/40 bg-muted/20 p-2 space-y-0.5 text-xs">
      {items.map((item) => (
        <div key={item} className={`px-3 py-1.5 rounded ${item === active ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground"}`}>{item}</div>
      ))}
    </div>
  );
}

export function MockFunnel({ stages }: { stages: { name: string; value: string; color: string }[] }) {
  return (
    <div className="space-y-2">
      {stages.map((s, i) => (
        <div key={s.name} className="flex items-center gap-3">
          <div className="w-24 text-xs font-medium text-right">{s.name}</div>
          <div className="flex-1 h-8 rounded-md overflow-hidden bg-muted/30">
            <div className={`h-full ${s.color} rounded-md flex items-center px-3`} style={{ width: `${100 - i * 20}%` }}>
              <span className="text-xs font-semibold text-white">{s.value}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function MockBadge({ text, variant = "default" }: { text: string; variant?: "default" | "success" | "warning" }) {
  const colors = {
    default: "bg-primary/10 text-primary",
    success: "bg-green-500/10 text-green-600 dark:text-green-400",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  };
  return <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium ${colors[variant]}`}>{text}</span>;
}

export function MockNav() {
  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground border-b border-border/30 pb-2 mb-3">
      <span className="font-bold text-foreground">MyUserJourney</span>
      <span>Dashboard</span>
      <span>Analytics</span>
      <span>Reports</span>
      <span>Settings</span>
    </div>
  );
}
