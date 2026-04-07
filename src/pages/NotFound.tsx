import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-xl flex-col items-center justify-center px-4 text-center">
      <div className="rounded-2xl border border-border/60 bg-card px-8 py-10 shadow-card">
        <h1 className="mb-2 font-display text-4xl font-bold">404</h1>
        <p className="mb-5 text-sm text-muted-foreground">Oops! Page not found</p>
        <Link to="/" className="text-primary link-underline hover:text-primary/90">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
