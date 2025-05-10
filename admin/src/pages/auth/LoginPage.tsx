import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ShieldCheck, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/features/auth/context/AuthContext";

// Validation schema using zod
const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, isAuthenticating, error: authError } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    }
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setFormError(null);
      await login(data.email, data.password);
    } catch (error: any) {
      setFormError(error.message);
      console.error("Login error:", error);
    }
  };

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

      <div className="flex-1 flex items-center justify-center p-6 bg-muted/10">
        <Card className="max-w-md w-full">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <CardTitle className="text-xl">Log in to your account</CardTitle>
            </div>
            <CardDescription>
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {/* Error message */}
              {(formError || authError) && (
                <Alert variant="destructive" className="text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {formError || authError}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  {...register("email")}
                  className={errors.email ? "border-destructive" : ""}
                  disabled={isAuthenticating}
                />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                  className={errors.password ? "border-destructive" : ""}
                  disabled={isAuthenticating}
                />
                {errors.password && (
                  <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
                )}
              </div>

              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              
              <div className="bg-muted/40 p-3 rounded-md border border-border/50 mt-4">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      For testing, use:
                    </p>
                    <p className="text-xs mt-1">
                      Email: <span className="font-medium">admin@example.com</span>
                    </p>
                    <p className="text-xs">
                      Password: <span className="font-medium">Admin123!</span>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col gap-4">
              <Button 
                className="w-full" 
                type="submit" 
                disabled={isAuthenticating}
              >
                {isAuthenticating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
              
              <div className="text-center text-sm">
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary hover:underline">
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}