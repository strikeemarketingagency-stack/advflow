"use client";

import * as React from "react";
import { useAuth } from "@/lib/auth/auth-provider";

export function useCollection<T>(loader: () => Promise<T>, deps: React.DependencyList = []) {
  const { status } = useAuth();
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(true);
  const depsKey = JSON.stringify(deps);

  const reload = React.useMemo(() => {
    return () => {
      if (status !== "authenticated") return Promise.resolve();
      setLoading(true);
      return loader().then((result) => {
        setData(result);
        setLoading(false);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, depsKey]);

  React.useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, reload, setData };
}
