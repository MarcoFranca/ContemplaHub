import { type EmailOtpType } from "@supabase/supabase-js";
import {
  createServerClient,
  type CookieMethodsServer,
  type CookieOptions,
} from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import {
  getConfiguredSiteUrl,
  getSafeNextPath,
} from "@/lib/auth/auth-urls";
import { resolveUserDestinationFromUserId } from "@/lib/auth/resolve-user-destination";

function buildRedirectWithMessage(
  request: NextRequest,
  message: string,
  pathname = "/login",
) {
  const url = new URL(pathname, request.url);
  url.searchParams.set("msg", message);
  return NextResponse.redirect(url);
}

function buildCallbackResponse(request: NextRequest) {
  return NextResponse.redirect(new URL("/login", request.url));
}

function finalizeRedirect(
  request: NextRequest,
  response: NextResponse,
  pathname: string,
) {
  response.headers.set("Location", new URL(pathname, request.url).toString());
  return response;
}

function createCallbackSupabaseClient(
  request: NextRequest,
  response: NextResponse,
) {
  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return request.cookies.getAll().map((cookie) => ({
        name: cookie.name,
        value: cookie.value,
      }));
    },
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value, options }) => {
        response.cookies.set({
          name,
          value,
          ...(options as CookieOptions),
        });
      });
    },
  };

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieMethods },
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = getSafeNextPath(searchParams.get("next"));
  const authError =
    searchParams.get("error_description") || searchParams.get("error");

  console.info("[auth/callback] received callback", {
    hasCode: Boolean(code),
    hasTokenHash: Boolean(tokenHash),
    type,
    hasNext: Boolean(next),
    hasAuthError: Boolean(authError),
  });

  if (authError) {
    console.warn("[auth/callback] provider returned error", {
      type,
      message: authError,
    });
    return buildRedirectWithMessage(request, authError);
  }

  const response = buildCallbackResponse(request);
  const supabase = createCallbackSupabaseClient(request, response);

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.warn("[auth/callback] code exchange failed", {
        message: error.message,
        type,
      });
      return buildRedirectWithMessage(
        request,
        "Falha ao concluir autenticacao.",
      );
    }

    const userId =
      data.user?.id ||
      data.session?.user?.id ||
      (await supabase.auth.getUser()).data.user?.id ||
      null;

    if (!userId) {
      console.warn("[auth/callback] exchange succeeded without user");
      return buildRedirectWithMessage(
        request,
        "Falha ao localizar usuario autenticado.",
      );
    }

    if (type === "recovery") {
      console.info("[auth/callback] recovery session established", { userId });
      return finalizeRedirect(request, response, next || "/reset-password");
    }

    const destination =
      next || (await resolveUserDestinationFromUserId(userId));

    console.info("[auth/callback] exchange succeeded", {
      userId,
      destination,
    });

    return finalizeRedirect(request, response, destination);
  }

  if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (error) {
      console.warn("[auth/callback] token verification failed", {
        type,
        message: error.message,
      });
      return buildRedirectWithMessage(
        request,
        "Falha ao validar link de autenticacao.",
      );
    }

    const userId =
      data.user?.id ||
      data.session?.user?.id ||
      (await supabase.auth.getUser()).data.user?.id ||
      null;

    if (!userId && type !== "signup") {
      console.warn("[auth/callback] token verified without user", { type });
      return buildRedirectWithMessage(
        request,
        "Falha ao localizar usuario autenticado.",
      );
    }

    if (type === "recovery") {
      console.info("[auth/callback] recovery token verified", { userId });
      return finalizeRedirect(request, response, next || "/reset-password");
    }

    if (userId) {
      const destination =
        next || (await resolveUserDestinationFromUserId(userId));

      console.info("[auth/callback] token verified", {
        userId,
        destination,
        type,
      });

      return finalizeRedirect(request, response, destination);
    }

    console.info("[auth/callback] signup token verified without session", {
      type,
    });
    return buildRedirectWithMessage(
      request,
      "Conta confirmada. Entre para continuar.",
    );
  }

  console.warn("[auth/callback] callback without supported auth params", {
    callbackUrl: `${getConfiguredSiteUrl()}/auth/callback`,
  });
  return buildRedirectWithMessage(
    request,
    "Callback de autenticacao invalido.",
  );
}
