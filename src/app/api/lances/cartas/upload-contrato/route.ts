import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const formData = await req.formData();

    const file = formData.get("file");
    const cotaId = formData.get("cota_id");
    const contratoId = formData.get("contrato_id");

    if (!(file instanceof File)) {
        return NextResponse.json({ error: "Arquivo inválido." }, { status: 400 });
    }

    if (!cotaId && !contratoId) {
        return NextResponse.json(
            { error: "cota_id ou contrato_id é obrigatório." },
            { status: 400 }
        );
    }

    // TODO:
    // 1. subir o arquivo para storage
    // 2. chamar backend FastAPI para vincular documento
    // 3. salvar metadata no banco

    return NextResponse.json({
        ok: true,
        file_name: file.name,
    });
}