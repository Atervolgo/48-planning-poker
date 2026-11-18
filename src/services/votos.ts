// RF-03 / criterio de aceptación 1: ocultar votos ajenos hasta revelar.
// Esta función es la que protege el secreto. El handler SIEMPRE pasa por aquí.

export interface VotoGuardado {
  uid: string;
  valor: number | string;
}

export interface VotoPublico {
  uid: string;
  voto: boolean; // ¿ya votó?
  valor?: number | string; // solo existe si la historia está revelada
}

export function prepararVotosParaCliente(
  votos: VotoGuardado[],
  miembros: string[],
  revelada: boolean,
): VotoPublico[] {
  return miembros.map((uid) => {
    const v = votos.find((x) => x.uid === uid);
    if (!v) return { uid, voto: false };
    // Antes de revelar: solo se dice "votó", NUNCA el valor
    return revelada ? { uid, voto: true, valor: v.valor } : { uid, voto: true };
  });
}
