import React, { useEffect, useState } from "react";
import style from "./style.module.scss";
import { Link } from "react-router-dom";
import {
  getDomainsDataByOwner,
  getPrimaryDomain,
  getDomainStatus,
} from "../../../name-service/fns-apis";
import { parseTimestampToDate } from "@utils/parse-timestamp-to-date";
import { useStore } from "../../../stores";

export const YourDomain = () => {
  const { accountStore, chainStore } = useStore();
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);

  const [domains, setDomains] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [primaryDomain, setPrimaryDomain]: any = useState(null);
  const [mintedOn, setMintedOn] = useState<any>({});
  const [isMintDateLoaded, setIsMintDateLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { domains: fetchedDomains } = await getDomainsDataByOwner(
          current.chainId,
          accountInfo.bech32Address
        );
        const primaryDom: any = await getPrimaryDomain(
          current.chainId,
          accountInfo.bech32Address
        );
        setDomains(fetchedDomains);
        setPrimaryDomain(primaryDom);
        setIsLoading(false);
        await Promise.all(
          fetchedDomains.map(async (domain: string) => {
            const domainStatus = (await getDomainStatus(
              current.chainId,
              domain
            )) as {
              domain_status: { Owned: { registration_time: any } };
            };
            const ownedDomain = domainStatus?.domain_status?.Owned;
            if (
              typeof ownedDomain === "object" &&
              ownedDomain.registration_time
            ) {
              const value = ownedDomain.registration_time;
              const parsedValue = parseTimestampToDate(value);
              setMintedOn((prevMintedOn: any) => ({
                ...prevMintedOn,
                [domain]: parsedValue,
              }));
            }
          })
        );
        setIsMintDateLoaded(true);
      } catch (error) {
        console.error("Error fetching domains:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className={style.allDomains}>
      {isLoading ? (
        <div className={style.loader}>
          Loading Domains
          <i className="fas fa-spinner fa-spin ml-2" />
        </div>
      ) : domains.length === 0 ? (
        <div className={style.loader}>No domains available right now.</div>
      ) : (
        domains.map((domain: any, index: number) => (
          <Link
            to={{
              pathname: "/fetch-name-service/domain-details",
              state: { domainName: domain, isOwned: true },
            }}
            className={style.domainCard}
            key={index}
          >
            <div className={style.domainDetails}>
              <div className={style.domainInfo}>
                <div>{domain}</div>
                <div
                  style={{
                    color: "var(--text-light, #808DA0)",
                    fontWeight: "lighter",
                  }}
                >
                  {" "}
                  Minted on{" "}
                  {isMintDateLoaded ? (
                    mintedOn[domain]
                  ) : (
                    <i className="fas fa-spinner fa-spin" />
                  )}
                </div>
              </div>

              {primaryDomain && primaryDomain.domain === domain && (
                <div className={style.inUse}>IN USE</div>
              )}
              <img
                className={style.arrowIcon}
                src={require("@assets/svg/arrow-right-outline.svg")}
                alt=""
              />
            </div>
          </Link>
        ))
      )}
    </div>
  );
};
