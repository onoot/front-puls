export function Preloader({ fullPage }: { fullPage?: boolean }) {
  if (fullPage) {
    return (
      <div className="preloader-overlay">
        <div className="preloader-spinner" />
      </div>
    );
  }
  return (
    <div className="preloader-inline">
      <div className="preloader-spinner" />
    </div>
  );
}
