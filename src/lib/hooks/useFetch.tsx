import { AuthContexts, AuthContextType } from "@/components/authProvider";
import { useState, useEffect, useCallback, useContext } from "react";

const useFetch = <T,>(url: string, options?: RequestInit) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const authContext = useContext<AuthContextType | null>(AuthContexts);
  const authToken = authContext?.token;
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headersInit = options?.headers;
      let headers: Record<string, string> = {};
      if (headersInit instanceof Headers) {
        headersInit.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (headersInit && typeof headersInit === "object") {
        headers = { ...headersInit } as Record<string, string>;
      }

      if (!headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
      }
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }
      const finalOptions: RequestInit = {
        ...options,
        headers,
      };
      const response = await fetch(url, finalOptions);

      if (!response.ok) {
        const errorBody = await response.text();
        let errorMessage = `HTTP error! Status: ${response.status}`;
        try {
          const parsedError = JSON.parse(errorBody);
          if (parsedError.message) {
            errorMessage = parsedError.message;
          } else if (parsedError.error) {
            errorMessage = parsedError.error;
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {}
        throw new Error(errorMessage);
      }
      const result: T = await response.json();
      setData(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error("An unknown error occurred during fetching."));
      }
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [url, JSON.stringify(options)]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
};

export default useFetch;
