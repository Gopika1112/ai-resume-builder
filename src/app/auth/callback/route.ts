import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { getURL } from "@/lib/utils";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  console.log("Full Callback URL:", request.url);
  console.log("Search Params:", searchParams.toString());
  const code = searchParams.get("code");
  // if "next" is in search params, use it as the redirection URL
  const next = searchParams.get("next") ?? "/build";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(getURL(next));
    } else {
      console.error("Auth Callback Error:", error.message);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(getURL("/login?error=auth-callback-failed"));
}
