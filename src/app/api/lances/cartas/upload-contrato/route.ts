import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
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

        // TODO real:
        // subir para storage
        // persistir vínculo no backend
        // salvar metadata

        return NextResponse.json({
            ok: true,
            file_name: file.name,
            file_url: null,
        });
    } catch (error) {
        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Erro ao processar upload.",
            },
            { status: 500 }
        );
    }
}