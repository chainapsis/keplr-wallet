import { useMemo } from "react";
import { usePaginatedCursorQuery } from "../../pages/main/token-detail/hook";
import { useBitcoinNetworkConfig } from "./use-bitcoin-network-config";

export interface InscriptionDelegate {
  delegate_id: string;
  render_url?: string;
  mime_type?: string;
  content_url: string;
  bis_url: string;
}

export interface Inscription {
  inscription_name?: string;
  inscription_id: string;
  inscription_number: number;
  parent_ids: string[];
  output_value: number;
  genesis_block_hash: string;
  genesis_ts: string;
  genesis_height: number;
  metadata: any;
  mime_type?: string;
  owner_wallet_addr: string;
  last_sale_price?: number;
  slug?: string;
  collection_name?: string;
  satpoint: string; // `${txid}:${vout}:${offset}`
  last_transfer_block_height?: number;
  content_url: string;
  bis_url: string;
  render_url?: string;
  bitmap_number?: number;
  delegate?: InscriptionDelegate;
}

export interface InscriptionsByAddressResponse {
  data: Inscription[];
  block_height: number;
}

export const useGetInscriptionsByAddress = (
  chainId: string,
  address: string,
  options: {
    order?: "asc" | "desc";
    offset?: number;
    count?: number;
    excludeBrc20?: boolean;
    cursedOnly?: boolean;
  } = {}
) => {
  const { bestInSlotApiUrl } = useBitcoinNetworkConfig(chainId);

  const {
    order: initialOrder,
    offset: initialOffset,
    count: initialCount,
    excludeBrc20,
    cursedOnly,
  } = options;

  const validatedOptions = useMemo(() => {
    let order = initialOrder;
    let offset = initialOffset;
    let count = initialCount;

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
      order: order ?? "desc",
      offset: offset ?? 0,
      count: count ?? 1000,
      excludeBrc20: !!excludeBrc20,
      cursedOnly: !!cursedOnly,
    };
  }, [initialOrder, initialOffset, initialCount, excludeBrc20, cursedOnly]);

  return usePaginatedCursorQuery<InscriptionsByAddressResponse>(
    bestInSlotApiUrl,
    () => {
      const params = new URLSearchParams();

      params.append("sort_by", "inscr_num");
      params.append("order", validatedOptions.order);
      params.append(
        "exclude_brc20",
        validatedOptions.excludeBrc20 ? "true" : "false"
      );
      if (validatedOptions.cursedOnly) {
        params.append("cursed_only", "true");
      }

      params.append("address", address);
      params.append("offset", validatedOptions.offset.toString());
      params.append("count", validatedOptions.count.toString());

      return `wallet/inscriptions?${params.toString()}`;
    },
    (page, _) => {
      return {
        sort_by: "inscr_num",
        order: validatedOptions.order,
        exclude_brc20: validatedOptions.excludeBrc20 ? "true" : "false",
        ...(validatedOptions.cursedOnly ? { cursed_only: "true" } : {}),
        address,
        offset: (
          validatedOptions.offset +
          page * validatedOptions.count
        ).toString(),
        count: validatedOptions.count.toString(),
      };
    },
    (res) => {
      return res.data.length < validatedOptions.count;
    }
  );
};
