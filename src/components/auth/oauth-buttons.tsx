import { Button } from "@/components/ui/button";
import { oauthSignInAction } from "@/lib/auth/actions";

export function OAuthButtons({
  providers,
  callbackUrl,
}: {
  providers: { id: string; name: string }[];
  callbackUrl: string;
}) {
  if (providers.length === 0) return null;
  return (
    <div className="grid gap-3">
      {providers.map((provider) => (
        <form key={provider.id} action={oauthSignInAction}>
          <input type="hidden" name="provider" value={provider.id} />
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <Button type="submit" variant="outline" className="w-full">
            Continue with {provider.name}
          </Button>
        </form>
      ))}
      <div className="text-muted-foreground flex items-center gap-3 text-xs uppercase">
        <span className="bg-border h-px flex-1" />
        or
        <span className="bg-border h-px flex-1" />
      </div>
    </div>
  );
}
