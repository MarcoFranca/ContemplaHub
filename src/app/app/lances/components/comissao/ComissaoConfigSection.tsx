"use client";

import type { CotaComissaoPayload, ParceiroSelectOption } from "../../types";
import { ComissaoBuilder } from "./ComissaoBuilder";

type Props = {
  value: CotaComissaoPayload;
  onChange: (next: CotaComissaoPayload) => void;
  parceirosDisponiveis: ParceiroSelectOption[];
  valorBase?: number | null;
};

export function ComissaoConfigSection({
                                        value,
                                        onChange,
                                        parceirosDisponiveis,
                                        valorBase,
                                      }: Props) {
  return (
      <ComissaoBuilder
          value={value}
          onChange={onChange}
          parceirosDisponiveis={parceirosDisponiveis}
          valorBase={valorBase}
      />
  );
}