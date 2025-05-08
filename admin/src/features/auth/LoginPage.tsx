import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { LoginForm } from "./components/LoginForm";

export function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Simple header with back button */}
      <header className="border-border border-b py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Centered login form with good spacing */}
      <div className="flex-1 flex items-center justify-center p-6 bg-muted/10">
        <LoginForm />
      </div>
    </div>
  );
}