import React, { useCallback } from "react";
import { Badge } from "reactstrap";
import { TooltipForDomainNames } from "../domain-details";
import style from "./style.module.scss";
import { useStore } from "../../../stores";
import { FNS_CONFIG } from "../../../config.ui.var";
import { useNotification } from "@components/notification";
import { useNavigate } from "react-router";
import { parseTimestampToDate } from "@utils/parse-timestamp-to-date";
import { observer } from "mobx-react-lite";

interface DomainCardProps {
  domain: string;
  index: number;
  primaryDomain: string;
  ownedDomains: string[];
  assignedDomains: string[];
}

export const DomainCard: React.FC<DomainCardProps> = observer(
  ({ domain, index, primaryDomain, ownedDomains, assignedDomains }) => {
    const { chainStore, queriesStore } = useStore();
    const notification = useNotification();
    const navigate = useNavigate();

    const current = chainStore.current;
    const FNSContractAddress = FNS_CONFIG[current.chainId].contractAddress;

    const { queryDomainStatus } = queriesStore.get(current.chainId).fns;

    const { isFetching: isMintDateFetching, registrationTime: domainMintedOn } =
      queryDomainStatus.getQueryContract(FNSContractAddress, domain);
    const parsedValue = parseTimestampToDate(domainMintedOn);

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
      <div
        onClick={() => navigate(`/fetch-name-service/domain-details/${domain}`)}
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
              {!isMintDateFetching ? (
                parsedValue
              ) : (
                <i className="fas fa-spinner fa-spin" />
              )}
            </div>
            <div style={{ display: "flex" }}>
              {primaryDomain === domain && (
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
                  style={{ background: "var(--indigo-indigo-500, #6360BF)" }}
                >
                  Owned
                </Badge>
              )}
              {assignedDomains.includes(domain) && (
                <Badge
                  className={style["badge"]}
                  style={{ border: "1px solid", background: "transparent" }}
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
    );
  }
);
