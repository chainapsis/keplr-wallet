import React from "react";
import style from "./style.module.scss";
import { useStore } from "../../../stores";
import classnames from "classnames";
import { Link } from "react-router-dom";
import { FNS_CONFIG } from "../../../config.ui.var";
import { observer } from "mobx-react-lite";
import { DomainCard } from "./domain-card";
export const YourDomain = observer(() => {
  const { accountStore, chainStore, queriesStore, analyticsStore } = useStore();
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);
  const FNSContractAddress = FNS_CONFIG[current.chainId].contractAddress;
  const executeQuery = (query: any, ...params: any) => {
    return query.getQueryContract(FNSContractAddress, ...params);
  };

  const {
    queryAllDomainsOwnedBy,
    queryPrimaryDomain,
    queryDomainsByBeneficiary,
  } = queriesStore.get(current.chainId).fns;

  const { domains: ownedDomains, isFetching: isAllOwnedFetching } =
    executeQuery(queryAllDomainsOwnedBy, accountInfo.bech32Address);

  const { primaryDomain } = executeQuery(
    queryPrimaryDomain,
    accountInfo.bech32Address
  );

  const { domains: assignedDomains } = executeQuery(
    queryDomainsByBeneficiary,
    accountInfo.bech32Address
  );
  const allDomains = [...new Set([...assignedDomains, ...ownedDomains])];

  return (
    <div className={style["allDomains"]}>
      {isAllOwnedFetching ? (
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
              onClick={() => {
                analyticsStore.logEvent("fns_explore_tab_click");
              }}
            >
              + Get new domain
            </Link>
          </div>
        </div>
      ) : (
        <div>
          {assignedDomains.length > 0 && !primaryDomain && (
            <div className={style["primaryHelp"]}>
              &#128161; Choose a primary domain from the options below, and it
              will appear on your dashboard.
            </div>
          )}
          {allDomains.map((domain: any, index: number) => (
            <DomainCard
              key={index}
              domain={domain}
              index={index}
              primaryDomain={primaryDomain}
              ownedDomains={ownedDomains}
              assignedDomains={assignedDomains}
            />
          ))}
          <Link
            to={`/fetch-name-service/explore`}
            onClick={() => {
              analyticsStore.logEvent("fns_explore_tab_click");
            }}
          >
            <div className={style["addNewbutton"]}>+ Get new domain</div>
          </Link>
        </div>
      )}
    </div>
  );
});
