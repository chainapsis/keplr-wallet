import React, { useCallback, useEffect, useState } from "react";
import style from "./style.module.scss";
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
import classnames from "classnames";
import { useNotification } from "@components/notification";
import { useNavigate } from "react-router";
import { Link } from "react-router-dom";

export const YourDomain = () => {
  const { accountStore, chainStore } = useStore();
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);
  const notification = useNotification();
  const navigate = useNavigate();
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

  const copyAddress = useCallback(
    async (address: string) => {
      await navigator.clipboard.writeText(address);
      notification.push({
        placement: "top-center",
        type: "success",
        duration: 2,
        content: "Domain Copied",
        canDelete: true,
        transition: {
          duration: 0.25,
        },
      });
    },
    [notification]
  );

  return (
    <div className={style["allDomains"]}>
      {isLoading ? (
        <div className={style["loader"]}>
          Loading Domains
          <i className="fas fa-spinner fa-spin ml-2" />
        </div>
      ) : allDomains.length === 0 ? (
        <div>
          <div className={style["loader"]}>
            <div>No domains available right now.</div>
            <Link
              className={classnames(
                style["addNewbutton"],
                style["emptyAddNewButton"]
              )}
              to={`/fetch-name-service/explore`}
            >
              + Get new domain
            </Link>
          </div>
        </div>
      ) : (
        <div>
          {assignedDomains.length > 0 && !primaryDomain?.domain && (
            <div className={style["primaryHelp"]}>
              &#128161; Choose a primary domain from the options below, and it
              will appear on your dashboard.
            </div>
          )}
          {allDomains.map((domain: any, index: number) => (
            <div
              onClick={() =>
                navigate(`/fetch-name-service/domain-details/${domain}`)
              }
              className={style["domainCard"]}
              key={index}
            >
              <div className={style["domainDetails"]}>
                <div className={style["domainInfo"]}>
                  <div style={{ display: "flex", flexDirection: "row" }}>
                    <TooltipForDomainNames domainName={domain} />
                    <i
                      className="fas fa-clone ml-2"
                      style={{
                        fontSize: "small",
                        marginTop: "4px",
                      }}
                      onClick={(e) => {
                        copyAddress(domain);
                        e.stopPropagation();
                      }}
                    />
                  </div>
                  <div
                    style={{
                      color: "var(--text-light, #808DA0)",
                      fontSize: "small",
                      margin: "10px 0",
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
                      <Badge
                        className={style["badge"]}
                        style={{ background: "#F9774B" }}
                      >
                        Primary
                      </Badge>
                    )}
                    {ownedDomains.includes(domain) && (
                      <Badge
                        className={style["badge"]}
                        style={{
                          background: "var(--indigo-indigo-500, #6360BF)",
                        }}
                      >
                        Owned
                      </Badge>
                    )}
                    {assignedDomains.includes(domain) && (
                      <Badge
                        className={style["badge"]}
                        style={{
                          border: "1px solid",
                          background: "transparent",
                        }}
                      >
                        Assigned
                      </Badge>
                    )}
                  </div>
                </div>

                <img
                  className={style["arrowIcon"]}
                  src={require("@assets/svg/arrow-right-outline.svg")}
                  alt=""
                />
              </div>
            </div>
          ))}
          <Link to={`/fetch-name-service/explore`}>
            <div className={style["addNewbutton"]}>+ Get new domain</div>
          </Link>
        </div>
      )}
    </div>
  );
};
