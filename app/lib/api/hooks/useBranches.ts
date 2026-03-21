import { useCallback, useEffect, useState } from "react";
import type { Branch } from "../models/branch";
import { createBranch, getBranches } from "../services/branches";
import type { ApiError } from "../api";
import {
  createLocalBranch,
  mergeBranches,
  type BranchCreateInput,
} from "../../branches/branchCatalogStorage";

export function useBranches() {
  const [data, setData] = useState<Branch[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [mode, setMode] = useState<"api" | "local-fallback">("api");

  const refresh = useCallback(() => {
    let alive = true;

    setLoading(true);
    setError(null);

    getBranches()
      .then((res) => {
        if (!alive) return;
        setData(mergeBranches(res));
        setMode("api");
      })
      .catch((e: ApiError) => {
        if (!alive) return;

        const localOnly = mergeBranches([]);
        setData(localOnly);
        setMode("local-fallback");
        setError(localOnly.length > 0 ? null : e);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const cleanup = refresh();
    return cleanup;
  }, [refresh]);

  const create = useCallback(
    async (input: BranchCreateInput) => {
      const existing = data ?? [];

      try {
        const created = await createBranch({
          address: input.address.trim(),
          description: input.description.trim(),
          idCompany: input.idCompany,
          idCity: input.idCity,
        });

        if (created) {
          setData(mergeBranches(existing, [created]));
          setMode("api");
          return created;
        }

        const fresh = await getBranches();
        const merged = mergeBranches(fresh);
        setData(merged);
        setMode("api");

        const fetchedCreated =
          merged.find(
            (branch) =>
              branch.idCompany === input.idCompany &&
              branch.idCity === input.idCity &&
              branch.address.trim().toLowerCase() === input.address.trim().toLowerCase()
          ) ?? null;

        if (fetchedCreated) return fetchedCreated;
      } catch {
        // fallback local below
      }

      const newBranch = createLocalBranch(input, existing);
      setData(mergeBranches(existing, [newBranch]));
      setMode("local-fallback");
      return newBranch;
    },
    [data]
  );

  return { data, loading, error, refresh, create, mode };
}
