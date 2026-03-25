import { ContratoFormShellV2 } from "@/features/contratos/components/contrato-form-shell-v2";
import { getContratoFormOptions } from "@/features/contratos/server/get-form-options";

interface Props {
    params: Promise<{ leadId: string }>;
}

export default async function NovoContratoCarteiraPage({ params }: Props) {
    const { leadId } = await params;
    const { administradoras, parceiros } = await getContratoFormOptions();

    return (
        <div className="p-6">
            <ContratoFormShellV2
                mode="registerExisting"
                leadId={leadId}
                administradoras={administradoras}
                parceiros={parceiros}
            />
        </div>
    );
}