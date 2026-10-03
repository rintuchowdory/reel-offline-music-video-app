import * as React from "react";
import { LogInIcon, LogOutIcon } from "lucide-react";
import { useAuth } from "@usehercules/auth/react";

import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "@/components/ui/button.tsx";

/**
 * Hercules Auth only accepts the app's own domain as a redirect target, so the
 * GitHub Pages mirror cannot complete an OIDC sign-in. When running on the
 * mirror, route sign-in to the main site instead of hitting the dead end.
 */
const MAIN_SITE_URL = "https://reel-music-videos.onhercules.app";

function isGithubPagesMirror() {
  return (
    typeof window !== "undefined" &&
    window.location.hostname.endsWith(".github.io")
  );
}

export interface SignInButtonProps
  extends Omit<ButtonProps, "onClick" | "disabled" | "children"> {
  signInText?: string;
  signOutText?: string;
  loadingText?: string;
  showIcon?: boolean;
}

/**
 * Renders a "Sign In" button that redirects to the Hercules auth page, or a
 * "Sign Out" button when already authenticated.
 */
export function SignInButton({
  signInText = "Sign In",
  signOutText = "Sign Out",
  loadingText,
  showIcon = true,
  className,
  variant,
  size,
  asChild = false,
  ...props
}: SignInButtonProps) {
  const { isAuthenticated, isLoading, signinRedirect, signoutRedirect } =
    useAuth();

  if (isGithubPagesMirror() && !isAuthenticated && !isLoading) {
    return (
      <Button
        className={cn("gap-2", className)}
        variant={variant ?? "default"}
        size={size}
        asChild
        {...props}
      >
        <a
          href={MAIN_SITE_URL}
          title="Sign-in is only available on the main site. Hercules Auth doesn't accept the GitHub Pages domain."
        >
          {showIcon && <LogInIcon className="size-4" />}
          {signInText}
        </a>
      </Button>
    );
  }

  const label = isAuthenticated
    ? signOutText
    : isLoading
      ? (loadingText ?? signOutText)
      : signInText;

  return (
    <Button
      className={cn("gap-2", className)}
      variant={
        variant ?? (isAuthenticated ? "secondary" : "default")
      }
      size={size}
      disabled={isLoading}
      aria-label={
        isAuthenticated
          ? "Sign out of your account"
          : "Sign in to your account"
      }
      onClick={() => {
        if (isAuthenticated) {
          void signoutRedirect?.();
        } else {
          void signinRedirect?.();
        }
      }}
      {...props}
    >
      {showIcon &&
        (isAuthenticated ? (
          <LogOutIcon className="size-4" />
        ) : (
          <LogInIcon className="size-4" />
        ))}
      {label}
    </Button>
  );
}
