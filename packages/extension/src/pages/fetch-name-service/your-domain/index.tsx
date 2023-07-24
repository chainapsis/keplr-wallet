import React, { useEffect, useState } from "react";
import style from "./style.module.scss";
import { Link } from "react-router-dom";
import {
  getDomainsByOwner,
  getPrimaryDomain,
  getDomainStatus,
  getDomainsByBeneficiery,
} from "../../../name-service/fns-apis";
import { parseTimestampToDate } from "@utils/parse-timestamp-to-date";
import { useStore } from "../../../stores";
import { Badge } from "reactstrap";
import { TooltipForDomainNames } from "../domain-details";

export const YourDomain = () => {
  const { accountStore, chainStore } = useStore();
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);

  const [primaryDomain, setPrimaryDomain]: any = useState(null);
  const [ownedDomains, setOwnedDomains] = useState<string[]>([]);
  const [assignedDomains, setAssignedDomains] = useState<string[]>([]);
  const [allDomains, setAllDomains] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mintedOn, setMintedOn] = useState<any>({});
  const [isMintDateLoaded, setIsMintDateLoaded] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { domains: owned } = await getDomainsByOwner(
          current.chainId,
          accountInfo.bech32Address
        );
        const { domains: assigned } = await getDomainsByBeneficiery(
          current.chainId,
          accountInfo.bech32Address
        );
        const primaryDom: any = await getPrimaryDomain(
          current.chainId,
          accountInfo.bech32Address
        );
        setAssignedDomains(assigned);
        setOwnedDomains(owned);
        setPrimaryDomain(primaryDom);

        const totalDomains = [...new Set([...assigned, ...owned])];
        setAllDomains(totalDomains);
        setIsLoading(false);
        await Promise.all(
          totalDomains.map(async (domain: string) => {
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
  }, [accountInfo.bech32Address, current.chainId]);

  return (
    <div className={style.allDomains}>
      {isLoading ? (
        <div className={style.loader}>
          Loading Domains
          <i className="fas fa-spinner fa-spin ml-2" />
        </div>
      ) : allDomains.length === 0 ? (
        <div className={style.loader}>No domains available right now.</div>
      ) : (
        allDomains.map((domain: any, index: number) => (
          <Link
            to={`/fetch-name-service/domain-details/${domain}`}
            className={style.domainCard}
            key={index}
          >
            <div className={style.domainDetails}>
              <div className={style.domainInfo}>
                <TooltipForDomainNames domainName={domain} />
                <div
                  style={{
                    color: "var(--text-light, #808DA0)",
                    fontWeight: "lighter",
                  }}
                >
                  Minted on{" "}
                  {isMintDateLoaded ? (
                    mintedOn[domain]
                  ) : (
                    <i className="fas fa-spinner fa-spin" />
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                  }}
                >
                  {primaryDomain?.domain === domain && (
                    <Badge className={style.badge} color="success" pill>
                      Primary
                    </Badge>
                  )}
                  {ownedDomains.includes(domain) && (
                    <Badge className={style.badge} color="warning" pill>
                      Owned
                    </Badge>
                  )}
                  {assignedDomains.includes(domain) && (
                    <Badge className={style.badge} color="primary" pill>
                      Assigned
                    </Badge>
                  )}
                </div>
              </div>

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
