import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ShieldCheck, Loader2, AlertCircle, ArrowLeft, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Validation schema using zod
const signupSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  const onSubmit = async (data: SignupFormValues) => {
    try {
      setFormError(null);
      setIsSubmitting(true);
      
      // Mock API call - in a real app, you would send the data to your backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log("Form data:", data);
      setSuccess(true);
      
    } catch (error: any) {
      setFormError(error.message || "An error occurred during signup");
      console.error("Signup error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header className="border-border border-b py-4 px-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Back to Home</span>
            </Link>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md w-full">
            <CardHeader className="space-y-1 items-center text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Account Created!</CardTitle>
              <CardDescription>
                Your account has been created successfully.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Thank you for signing up. You can now log in to your account to access all features.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Link to="/login" className="w-full">
                <Button className="w-full">Login to Your Account</Button>
              </Link>
              <Link to="/" className="w-full">
                <Button variant="outline" className="w-full">Return to Home</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

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
              <CardTitle className="text-xl">Create your account</CardTitle>
            </div>
            <CardDescription>
              Enter your information to create an account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {/* Error message */}
              {formError && (
                <Alert variant="destructive" className="text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {formError}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium">
                    First Name
                  </label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    {...register("firstName")}
                    className={errors.firstName ? "border-destructive" : ""}
                    disabled={isSubmitting}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-destructive mt-1">{errors.firstName.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium">
                    Last Name
                  </label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    {...register("lastName")}
                    className={errors.lastName ? "border-destructive" : ""}
                    disabled={isSubmitting}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive mt-1">{errors.lastName.message}</p>
                  )}
                </div>
              </div>
              
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                />
                {errors.password && (
                  <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                  className={errors.confirmPassword ? "border-destructive" : ""}
                  disabled={isSubmitting}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>
              
              <div className="text-sm text-muted-foreground">
                By clicking Sign Up, you agree to our{" "}
                <Link to="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
                .
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col gap-4">
              <Button 
                className="w-full" 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Sign Up"
                )}
              </Button>
              
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}