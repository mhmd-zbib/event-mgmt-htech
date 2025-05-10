// filepath: /home/zbib/Development/projects/htech-assesment/admin/src/features/auth/components/LoginForm.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthHook } from "../hooks";

// Default credentials for testing
const DEFAULT_EMAIL = "admin@example.com";
const DEFAULT_PASSWORD = "Admin123!";

// Validation schema
const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { handleLogin, isAuthenticating, error: authError } = useAuthHook();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: DEFAULT_EMAIL,
      password: "",
    }
  });

  const onSubmit = async (data: LoginFormValues) => {
    setFormError(null);
    const success = await handleLogin(data.email, data.password);
    
    if (!success && !authError) {
      setFormError("Login failed. Please try again.");
    }
  };

  return (
    <Card className="max-w-md w-full">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <CardTitle className="text-xl">Admin Login</CardTitle>
        </div>
        <CardDescription>
          Sign in to access the event management dashboard
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
              placeholder="Enter your email"
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
              placeholder="Enter your password"
              {...register("password")}
              className={errors.password ? "border-destructive" : ""}
              disabled={isAuthenticating}
            />
            {errors.password && (
              <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
            )}
          </div>
          
          <div className="bg-muted/40 p-3 rounded-md border border-border/50 mt-4">
            <div className="flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">
                  For testing, use:
                </p>
                <p className="text-xs mt-1">
                  Email: <span className="font-medium">{DEFAULT_EMAIL}</span>
                </p>
                <p className="text-xs">
                  Password: <span className="font-medium">{DEFAULT_PASSWORD}</span>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-4 pt-2">
          <Button 
            className="w-full" 
            type="submit" 
            disabled={isAuthenticating}
          >
            {isAuthenticating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Authenticating
              </>
            ) : (
              "Login to Dashboard"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}