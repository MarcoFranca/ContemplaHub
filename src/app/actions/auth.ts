// src/app/actions/auth.ts
"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

const emailSchema = z.object({ email: z.string().email() });
const passSchema  = z.object({ email: z.string().email(), password: z.string().min(6) });
const signUpSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2).max(120).optional(),
});

export async function signInWithOtpAction(formData: FormData) {
    const email = String(formData.get("email") ?? "");
    if (!emailSchema.safeParse({ email }).success) return { ok:false, message:"Informe um e-mail válido." };
    const supabase = await supabaseServer();
    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` },
    });
    if (error) return { ok:false, message:error.message };
    return { ok:true, message:"Enviamos um link de acesso ao seu e-mail." };
}

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
            data: { name }, // user_metadata (opcional)
        },
    });

    if (error) return { ok: false, message: error.message };

    // Se a confirmação de e-mail estiver DESLIGADA, a sessão já existe:
    const { data: { session } } = await supabase.auth.getSession();
    if (session) redirect("/app");

    // Se confirmação estiver LIGADA, orientar usuário:
    return {
        ok: true,
        message: "Conta criada! Enviamos um e-mail para confirmar seu acesso.",
    };
}

export async function signUpWithOtpAction(formData: FormData) {
    const email = String(formData.get("email") ?? "");
    const parsed = emailSchema.safeParse({ email });
    if (!parsed.success) return { ok: false, message: "Informe um e-mail válido." };

    const supabase = await supabaseServer();
    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` },
    });

    if (error) return { ok: false, message: error.message };
    return { ok: true, message: "Enviamos um link de acesso ao seu e-mail." };
}

export async function signOutAction() {
    const supabase = await supabaseServer();
    await supabase.auth.signOut();
    redirect("/login");
}
