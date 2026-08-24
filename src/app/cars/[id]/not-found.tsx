export default function NotFound() {
  return (
    <div className="mx-auto grid max-w-6xl gap-2 px-4 py-12">
      <p className="font-mono text-[0.65rem] tracking-[0.22em] text-muted-foreground uppercase">
        Missing
      </p>
      <h1 className="font-heading text-4xl font-medium tracking-tight italic">Car not found</h1>
      <p className="text-muted-foreground">This listing is not in the roster.</p>
    </div>
  );
}
