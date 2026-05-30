import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@malpeos/shared";
import type { Party, PartyWithBalance, LedgerEntryWithRelations } from "@malpeos/shared";

async function fetchParties(): Promise<PartyWithBalance[]> {
  const supabase = getSupabaseClient();
  const { data: partiesData, error: partiesError } = await supabase
    .from("parties")
    .select("*")
    .order("name");

  if (partiesError) throw partiesError;

  const { data: ledgerData, error: ledgerError } = await supabase
    .from("ledger_entries")
    .select("party_id, entry_type, amount");

  if (ledgerError) throw ledgerError;

  const balanceMap = new Map<string, number>();
  (ledgerData || []).forEach((entry: any) => {
    const current = balanceMap.get(entry.party_id) || 0;
    if (entry.entry_type === "credit") {
      balanceMap.set(entry.party_id, current + Number(entry.amount));
    } else {
      balanceMap.set(entry.party_id, current - Number(entry.amount));
    }
  });

  return (partiesData || []).map((party: any) => ({
    ...party,
    balance: balanceMap.get(party.id) || 0,
  })) as PartyWithBalance[];
}

async function fetchPartyLedger(partyId: string): Promise<{
  party: Party;
  entries: LedgerEntryWithRelations[];
}> {
  const supabase = getSupabaseClient();

  const { data: partyData, error: partyError } = await supabase
    .from("parties")
    .select("*")
    .eq("id", partyId)
    .single();

  if (partyError) throw partyError;

  const { data: entriesData, error: entriesError } = await supabase
    .from("ledger_entries")
    .select(`
      *,
      boats:boat_id ( id, name ),
      trips:trip_id ( id, start_date, end_date )
    `)
    .eq("party_id", partyId)
    .order("entry_date", { ascending: false });

  if (entriesError) throw entriesError;

  return {
    party: partyData as Party,
    entries: (entriesData || []) as unknown as LedgerEntryWithRelations[],
  };
}

export function useParties() {
  return useQuery({
    queryKey: ["parties"],
    queryFn: fetchParties,
    staleTime: 1000 * 60 * 2,
  });
}

export function usePartyLedger(partyId: string | undefined) {
  return useQuery({
    queryKey: ["party-ledger", partyId],
    queryFn: () => fetchPartyLedger(partyId!),
    enabled: !!partyId,
    staleTime: 1000 * 60 * 1,
  });
}