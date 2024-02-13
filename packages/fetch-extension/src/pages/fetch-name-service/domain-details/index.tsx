import domainImage from "@assets/icon/domain-image.png";
import { ToolTip } from "@components/tooltip";
import { Tab } from "@new-components/tab";
import { formatDomain } from "@utils/format";
import { observer } from "mobx-react-lite";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router";
import { FNS_CONFIG } from "../../../config.ui.var";
import { HeaderLayout } from "../../../new-layouts";
import { useStore } from "../../../stores";
import { BuyOrBid } from "./buy-or-bid";
import { TXN_TYPE, properties, tabs } from "./constants";
import { Mint } from "./mint";
import style from "./style.module.scss";
import { Update } from "./update";

export const TooltipForDomainNames = ({
  domainName,
}: {
  domainName: string;
}) => {
  return domainName.length >= 15 ? (
    <ToolTip
      tooltip={(() => {
        return domainName;
      })()}
      trigger="hover"
      options={{
        placement: "top",
      }}
    >
      <div>{formatDomain(domainName)}</div>
    </ToolTip>
  ) : (
    <div>{formatDomain(domainName)}</div>
  );
};

const getDomainStatus = (domain_status: any, sender: string) => {
  let isMinted = false;
  let isOwned = false;

  try {
    if (domain_status) {
      if (
        typeof domain_status === "object" &&
        domain_status.Owned.owner === sender
      ) {
        isMinted = true;
        isOwned = true;
      } else if (
        typeof domain_status === "object" &&
        domain_status.Owned.owner !== sender
      ) {
        isMinted = true;
        isOwned = false;
      } else if (
        typeof domain_status === "string" &&
        domain_status === "Available"
      ) {
        isMinted = false;
        isOwned = false;
      }
    }
  } catch (error) {
    console.error("Error fetching domain data:", error);
  }

  return { isMinted, isOwned };
};

const getMessageForInProgressTx = (type: string) => {
  switch (type) {
    case TXN_TYPE.MINT:
      return "Mint Transaction in Progress";
    case TXN_TYPE.SET_PRIMARY:
      return "Transaction to make domain Primary in Progress";
    case TXN_TYPE.UPDATE_DOMAIN:
      return "Transaction to update domain Details in Progress";
    default:
      return "Transaction In Progress";
  }
};

export const DomainDetails: FunctionComponent = observer(() => {
  const domain = useLocation().pathname.split("/")[3];
  const navigate = useNavigate();
  const { accountStore, chainStore, queriesStore, analyticsStore } = useStore();
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);
  const sender = accountInfo.bech32Address;
  const [domainName, setDomainName] = useState<string>(domain);
  const [domainData, setDomainData] = useState<any>({});
  const [oldDomainData, setOldDomainData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  let domainPrice: any = {};
  let isAssigned: any = false;
  let isPrimary: boolean = false;
  const [message, setMessage] = useState<string>("Loading Domain Info");
  const [activeTab, _setActiveTab] = useState("properties");
  const {
    queryPrimaryDomain,
    queryDomainStatus,
    queryBeneficiaryAddress,
    queryDomainData,
    queryDomainPrice,
  } = queriesStore.get(current.chainId).fns;

  const { beneficiaryAddress } = queryBeneficiaryAddress.getQueryContract(
    FNS_CONFIG[current.chainId].contractAddress,
    domainName
  );
  if (beneficiaryAddress === sender) isAssigned = true;
  const { primaryDomain } = queryPrimaryDomain.getQueryContract(
    FNS_CONFIG[current.chainId].contractAddress,
    accountInfo.bech32Address
  );
  if (primaryDomain === domainName) isPrimary = true;

  const { domain_data, isFetching: isDomainDataFetching } =
    queryDomainData.getQueryContract(
      FNS_CONFIG[current.chainId].contractAddress,
      domainName
    );

  useEffect(() => {
    setDomainData(domain_data || {});
    setOldDomainData(domain_data || {});
  }, [domain_data]);

  const { domain_status } = queryDomainStatus.getQueryContract(
    FNS_CONFIG[current.chainId].contractAddress,
    domainName
  );

  const { isMinted: fetchedIsMinted, isOwned: fetchedIsOwned } =
    getDomainStatus(domain_status, sender);

  const { price } = queryDomainPrice.getQueryContract(
    FNS_CONFIG[current.chainId].contractAddress,
    domainName
  );
  domainPrice = price || {};

  const handleTabChange = (tabName: string) => {
    analyticsStore.logEvent(`fns_${tabName.toLowerCase()}_tab_click`);
    if (tabName === "properties")
      navigate("/fetch-name-service/domain-details/" + domainName);
    else window.open(`https://www.fetns.domains/domains/${domainName}`);
  };

  useEffect(() => {
    if (accountInfo.txTypeInProgress.includes(domain)) {
      const type = accountInfo.txTypeInProgress.split(":")[0];
      setMessage(getMessageForInProgressTx(type));
      setIsLoading(true);
      setDomainName("");
    } else {
      setDomainName(domain);
      setIsLoading(false);
    }
  }, [accountInfo.txTypeInProgress, domain]);

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={formatDomain(domainName)}
      onBackButton={useCallback(() => {
        analyticsStore.logEvent("back_click", { pageName: "Domain Detail" });
        navigate(-1);
      }, [navigate])}
      rightRenderer={
        <a
          href={`https://www.fetns.domains/domains/${domainName}`}
          target="_blank"
          rel="noreferrer"
        >
          <i className="fas fa-external-link-alt" style={{ color: "white" }} />
        </a>
      }
      showBottomMenu={true}
    >
      {isLoading || isDomainDataFetching ? (
        <div className={style["loader"]}>
          {message}{" "}
          {!message.includes("Error") && (
            <i className="fas fa-spinner fa-spin ml-2" />
          )}
        </div>
      ) : null}
      <div>
        <Tab tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />
        <div className={style["domainIntro"]}>
          <img
            style={{ height: "130px" }}
            src={domainData.background || domainImage}
            alt="Domain Image"
          />
          {!domainData.background && (
            <div className={style["imageText"]}>
              <TooltipForDomainNames domainName={domainName.toUpperCase()} />
            </div>
          )}
          <div className={style["availability"]}>
            {fetchedIsMinted ? (fetchedIsOwned ? "OWNED" : "BUY") : "AVAILABLE"}
          </div>
          <div className={style["description"]}>
            <textarea
              disabled={
                !fetchedIsOwned || !FNS_CONFIG[current.chainId].isEditable
              }
              value={domainData.description}
              style={{
                backgroundColor: "transparent",
                borderColor: "transparent",
                color: "white",
                resize: "none",
                textAlign: "center",
              }}
              onDragStart={(e) => e.preventDefault()}
              placeholder={
                fetchedIsOwned
                  ? "Click to edit description"
                  : "Description hasn't been set"
              }
              maxLength={255}
              onChange={(e) => {
                setDomainData({
                  ...domainData,
                  description: e.target.value,
                });
              }}
            />
          </div>
        </div>
        {fetchedIsOwned && !domainData.address && (
          <div className={style["beneficiaryHelp"]}>
            &#128161; Assign a beneficiary address to make the domain point to
            it.
          </div>
        )}
        <div className={style["domainInfoGroup"]}>
          {Object.keys(domainData)
            .filter((key: string) => properties.includes(key))
            .map((property) => (
              <div className={style["domainInfo"]} key={property}>
                <div className={style["keys"]}>{property}</div>
                <input
                  disabled={
                    !fetchedIsOwned || !FNS_CONFIG[current.chainId].isEditable
                  }
                  className={style["values"]}
                  value={domainData[property]}
                  onDragStart={(e) => e.preventDefault()}
                  placeholder={fetchedIsOwned ? "Click to edit" : "Not Set"}
                  onChange={(e) => {
                    setDomainData({
                      ...domainData,
                      [property]: e.target.value,
                    });
                  }}
                />
              </div>
            ))}
        </div>
        {!isDomainDataFetching &&
          (fetchedIsOwned || isAssigned ? (
            <Update
              domainName={domainName}
              domainPrice={domainPrice}
              domainData={domainData}
              isOwned={fetchedIsOwned}
              isAssigned={isAssigned}
              isPrimary={isPrimary}
              oldDomainData={oldDomainData}
            />
          ) : fetchedIsMinted && !fetchedIsOwned && !isAssigned ? (
            <BuyOrBid domainName={domainName} />
          ) : (
            <Mint domainPrice={domainPrice} domainName={domainName} />
          ))}
      </div>
    </HeaderLayout>
  );
});
