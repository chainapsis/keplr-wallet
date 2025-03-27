import { useMemo } from "react";
import { usePaginatedCursorQuery } from "../../pages/main/token-detail/hook";
import { useBitcoinNetworkConfig } from "./use-bitcoin-network-config";

export interface RunesOutput {
  pkscript: string;
  wallet_addr: string;
  output: string; // `${txid}:${vout}`
  rune_ids: string[];
  balances: number[];
  rune_names: string[];
  spaced_rune_names: string[];
  total_balances: string[];
  min_listed_unit_price_in_sats: string;
  min_listed_unit_price_unisat: string;
}

export interface RunesOutputsByAddressResponse {
  data: RunesOutput[];
  block_height: number;
}

export const useGetRunesOutputsByAddress = (
  chainId: string,
  address: string,
  options: {
    sortBy?: "output" | "min_price" | "unisat_price";
    order?: "asc" | "desc";
    offset?: number;
    count?: number;
  } = {}
) => {
  const { bitcoinInscriptionApiUrl } = useBitcoinNetworkConfig(chainId);

  const {
    sortBy: initialSortBy,
    order: initialOrder,
    offset: initialOffset,
    count: initialCount,
  } = options;

  const validatedOptions = useMemo(() => {
    let sortBy = initialSortBy;
    let order = initialOrder;
    let offset = initialOffset;
    let count = initialCount;

    if (sortBy && !["output", "min_price", "unisat_price"].includes(sortBy)) {
      console.warn(
        `Invalid sortBy value: ${sortBy}. Using default "output" instead.`
      );
      sortBy = "output";
    }

    if (order && !["asc", "desc"].includes(order)) {
      console.warn(
        `Invalid order value: ${order}. Using default "desc" instead.`
      );
      order = "desc";
    }

    if (offset !== undefined) {
      if (
        typeof offset !== "number" ||
        offset < 0 ||
        !Number.isInteger(offset)
      ) {
        console.warn(
          `Invalid offset value: ${offset}. Using default 0 instead.`
        );
        offset = 0;
      }
    }

    if (count !== undefined) {
      if (typeof count !== "number" || count <= 0 || !Number.isInteger(count)) {
        console.warn(
          `Invalid count value: ${count}. Using default 1000 instead.`
        );
        count = 1000;
      } else if (count > 2000) {
        console.warn(
          `Count value ${count} exceeds maximum 2000. Using 2000 instead.`
        );
        count = 2000;
      }
    }

    return {
      sortBy: sortBy ?? "output",
      order: order ?? "desc",
      offset: offset ?? 0,
      count: count ?? 1000,
    };
  }, [initialSortBy, initialOrder, initialOffset, initialCount]);

  return usePaginatedCursorQuery<RunesOutputsByAddressResponse>(
    bitcoinInscriptionApiUrl,
    () => {
      const params = new URLSearchParams();

      params.append("sort_by", validatedOptions.sortBy);
      params.append("order", validatedOptions.order);
      params.append("address", address);
      params.append("offset", validatedOptions.offset.toString());
      params.append("count", validatedOptions.count.toString());

      return `runes/wallet_valid_outputs?${params.toString()}`;
    },
    (page, _) => {
      return {
        sort_by: validatedOptions.sortBy,
        order: validatedOptions.order,
        address,
        offset: (
          validatedOptions.offset +
          page * validatedOptions.count
        ).toString(),
        count: validatedOptions.count.toString(),
      };
    },
    (res) => {
      // 주소가 없는 경우 무조건 끝
      return address === "" ? true : res.data.length < validatedOptions.count;
    },
    undefined,
    undefined,
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
    true // 기존의 쿼리 파라미터 대체
  );
};
