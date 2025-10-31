"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

const passSchema  = z.object({ email: z.string().email(), password: z.string().min(6) });
const signUpSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2).max(120).optional(),
});

export async function signInWithPasswordAction(formData: FormData) {
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    if (!passSchema.safeParse({ email, password }).success) return { ok:false, message:"Credenciais inválidas." };
    const supabase = await supabaseServer();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok:false, message:error.message };
    redirect("/app");
}

export async function signUpWithPasswordAction(formData: FormData) {
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const name = String(formData.get("name") ?? "");
    const parsed = signUpSchema.safeParse({ email, password, name: name || undefined });
    if (!parsed.success) return { ok: false, message: "Preencha e-mail e senha válidos." };

    const supabase = await supabaseServer();
    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
            data: { name },
        },
    });

    if (error) return { ok: false, message: error.message };

    const { data: { session } } = await supabase.auth.getSession();
    if (session) redirect("/app");

    return { ok: true, message: "Conta criada! Enviamos um e-mail para confirmar seu acesso." };
}

export async function resendConfirmationAction(formData: FormData) {
    const email = String(formData.get("email") ?? "");
    if (!email) return { ok: false, message: "Informe o e-mail." };

    const supabase = await supabaseServer();
    const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` },
    });

    if (error) return { ok: false, message: error.message };
    return { ok: true, message: "Reenviamos o e-mail de confirmação." };
}

export async function signOutAction() {
    const supabase = await supabaseServer();
    await supabase.auth.signOut();
    redirect("/login");
}
