import { useState, useEffect } from "react";
import { useFetch } from "./use-fetch";
import { Dec } from "@everett-protocol/cosmosjs/common/decimal";
import Axios from "axios";

export interface Validator {
  operator_address: string;
  consensus_pubkey: string;
  jailed: boolean;
  status: number;
  tokens: string;
  delegator_shares: string;
  description: {
    moniker: string;
    identity: string;
    website: string;
    details: string;
  };
  unbonding_height: string;
  unbonding_time: string;
  commission: {
    rate: string;
    max_rate: string;
    max_change_rate: string;
    update_time: string;
  };
  min_self_delegation: string;
  /**
   * The url of thumbnail image.
   * This is not the native field from validator but just helper field.
   * This may be the image from keybase with matched description.identity as keybase ID suffix.
   * This will be fetched gradually.
   * This field will be `undefined` if not yet fetched.
   * This field will be empty string "" if fetched but error ocurrs or not have keybase profile image.
   */
  thumbnail?: string;
}

/**
 * @param baseUrl Url of rest endpoint
 */
export const useValidator = (baseUrl: string) => {
  const [validators, setValidators] = useState<Validator[]>([]);

  const fetch = useFetch<{ result: Validator[] }>(
    baseUrl + "/staking/validators",
    "get"
  );

  useEffect(() => {
    if (fetch.data && fetch.data.result) {
      let validators = fetch.data.result;
      validators = validators.sort((v1, v2) => {
        return new Dec(v1.delegator_shares).gt(new Dec(v2.delegator_shares))
          ? -1
          : 1;
      });

      setValidators(validators);
    }
  }, [fetch.data]);

  useEffect(() => {
    /**
     * TODO: Name of variable is "isMounted". But this naming doesn't fully convey its meaning.
     * This means that it will be true until this props haven't be changed.
     * There will be a better naming.
     */
    let isMounted = true;

    // Fetch thumbnail.
    // Return whether there is a change
    const fetchThumbnail = async (
      reminder: number,
      len: number
    ): Promise<boolean> => {
      let validator: Validator | undefined;
      for (let i = 0; i < validators.length; i++) {
        if (i % len === reminder) {
          if (validators[i].thumbnail === undefined) {
            validator = validators[i];
            break;
          }
        }
      }

      if (validator) {
        validator.thumbnail = "";
        try {
          const result = await Axios.get<{
            status: {
              code: number;
              name: string;
            };
            them: [
              {
                id: string;
                pictures: {
                  primary: {
                    url: string;
                  };
                };
              }
            ];
          }>(
            `https://keybase.io/_/api/1.0/user/lookup.json?fields=pictures&key_suffix=${validator.description.identity}`
          );

          if (result.status === 200 && result.data?.status?.code === 0) {
            const them = result.data?.them;
            if (them && them.length > 0) {
              const pictureUrl = them[0].pictures?.primary?.url;
              if (pictureUrl) {
                validator.thumbnail = pictureUrl;
              }
            }
          }
        } catch (e) {
          console.log(
            `Error occurs during fetching thumbnail for validator: ${e.toString()}`
          );
        }
        return true;
      }

      return false;
    };

    (async () => {
      if (validators && validators.length > 0) {
        const fetches: Promise<boolean>[] = [];

        // Fetch 10 items at once.
        const len = 10;
        for (let i = 0; i < len; i++) {
          fetches.push(fetchThumbnail(i, len));
        }

        const result = await Promise.all(fetches);

        for (const r of result) {
          if (r && isMounted) {
            // If their is change, re-render the validators.
            setValidators(validators.slice());
            return;
          }
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [validators]);

  return {
    validators,
    refresh: fetch.refresh,
    fetching: fetch.fetching
  };
};
