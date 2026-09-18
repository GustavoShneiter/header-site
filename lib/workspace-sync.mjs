export const workspaceSections = [
  { key: "tasks", table: "header_tasks", label: "Tarefas" },
  { key: "events", table: "header_events", label: "Calendário" },
  { key: "habits", table: "header_habits", label: "Hábitos" },
  { key: "challenges", table: "header_challenges", label: "Desafios" },
  { key: "finance", table: "header_finance_items", label: "Financeiro" },
  { key: "profile", table: "header_profiles", label: "Perfil" },
];

export function syncErrorMessage(error) {
  const detail = error?.message || "Não foi possível conectar. Tente novamente.";
  if (["PGRST204", "PGRST205", "42P01", "42703"].includes(error?.code) ||
      /Could not find (the table|the .*column).*schema cache/i.test(detail)) {
    return "A estrutura do banco está incompleta ou não foi reconhecida. Execute o arquivo completo db/002_workspace.sql no projeto Header do Supabase e atualize os dados.";
  }
  return detail;
}

// Each section owns its result: an unavailable optional table must never
// discard tasks that were successfully returned by the server.
export async function loadWorkspace(client, ownerId) {
  return Promise.all(workspaceSections.map(async section => {
    try {
      let query = client.from(section.table).select("*")
        .eq(section.key === "profile" ? "id" : "owner_id", ownerId);
      if (section.key === "tasks") query = query.order("position");
      if (section.key === "profile") query = query.maybeSingle();
      const result = await query;
      return { ...section, data: result.data, error: result.error ?? null };
    } catch (error) {
      return { ...section, data: null, error };
    }
  }));
}
