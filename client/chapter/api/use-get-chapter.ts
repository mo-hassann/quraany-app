import { useQuery } from "@tanstack/react-query";

import client from "@/server/client";

import { handleErrors } from "@/lib/errors";

export default function useGetChapter(id: string) {
  const query = useQuery({
    queryKey: ["chapter", id],
    queryFn: async () => {
      const res = await client.api.v1.chapter[":id"].$get({ param: { id } });

      // handle throw the error response
      if (!res.ok) {
        throw await handleErrors(res);
      }
      const { data } = await res.json();

      return data;
    },
  });

  return query;
}
