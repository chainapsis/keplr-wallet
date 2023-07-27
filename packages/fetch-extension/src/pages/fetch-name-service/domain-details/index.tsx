import domainImage from "@assets/icon/domain-image.png";
import { ToolTip } from "@components/tooltip";
import { formatDomain } from "@utils/format";
import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router";
import { FNS_CONFIG } from "../../../config.ui.var";
import {
  getBeneficiaryAddress,
  getDomainData,
  getDomainPrice,
  getDomainStatus,
  getPrimaryDomain,
} from "../../../name-service/fns-apis";
import { HeaderLayout } from "../../../new-layouts";
import { useStore } from "../../../stores";
import { BuyOrBid } from "./buy-or-bid";
import { Mint } from "./mint";
import { MessagePopup } from "./popup";
import style from "./style.module.scss";
import { Update } from "./update";
import { observer } from "mobx-react-lite";
import { Tab } from "@new-components/tab";

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
const tabs = [
  { tabName: "properties", displayName: "Properties" },
  { tabName: "bids", displayName: "Bids" },
  { tabName: "activities", displayName: "Activities" },
];
const properties = [
  "address",
  "email",
  "github",
  "website",
  "twitter",
  "background",
];

export const DomainDetails: FunctionComponent = observer(() => {
  const domainName = useLocation().pathname.split("/")[3];
  const navigate = useNavigate();
  const { accountStore, chainStore } = useStore();
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);
  const sender = accountInfo.bech32Address;
  const [domainData, setDomainData] = useState<any>({});
  const [oldDomainData, setOldDomainData] = useState<any>({});
  const [domainPrice, setDomainPrice] = useState<any>(null);
  const [isMinted, setIsMinted] = useState<any>(null);
  const [isAssigned, setIsAssigned] = useState(false);
  const [isPrimary, setIsPrimary] = useState(false);
  const [isOwned, setIsOwned] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("Loading Domain Info");
  const [showPopup, _setShowPopup] = useState(false);
  const [activeTab, _setActiveTab] = useState("properties");

  useEffect(() => {
    const checkIsAssigned = async () => {
      const beneficiery = await getBeneficiaryAddress(
        current.chainId,
        domainName
      );
      if (beneficiery.address === sender) {
        setIsAssigned(true);
      }
    };
    const checkIsPrimary = async () => {
      const primaryDomain = await getPrimaryDomain(current.chainId, sender);
      if (primaryDomain.domain === domainName) {
        setIsPrimary(true);
      }
    };
    const fetchDomainData = async () => {
      try {
        setMessage("Loading Domain Info");
        const fetchedDomainData = await getDomainData(
          current.chainId,
          domainName
        );
        setDomainData(fetchedDomainData.domain_data || {});
        setOldDomainData(fetchedDomainData.domain_data || {});
        const isDomainMinted = await getDomainStatus(
          current.chainId,
          domainName
        );
        const fetchDomainPrice = await getDomainPrice(
          current.chainId,
          domainName
        );
        setDomainPrice(fetchDomainPrice);
        const domainStatus = isDomainMinted?.domain_status;
        if (domainStatus) {
          if (
            typeof domainStatus === "object" &&
            domainStatus.Owned.owner === sender
          ) {
            setIsMinted(true);
            setIsOwned(true);
          } else if (
            typeof domainStatus === "object" &&
            domainStatus.Owned.owner !== sender
          ) {
            setIsMinted(true);
            setIsOwned(false);
          } else if (
            typeof domainStatus === "string" &&
            domainStatus === "Available"
          ) {
            setIsMinted(false);
            setIsOwned(false);
          }
        }
        setIsLoading(false);
      } catch (error) {
        setMessage("Error fetching domain data");
        console.error("Error fetching domain data:", error);
      }
    };
    setIsLoading(true);
    if (accountInfo.txTypeInProgress.includes(domainName)) {
      const type = accountInfo.txTypeInProgress.split(":")[0];
      switch (type) {
        case "mint":
          setMessage("Mint Transaction in Progress");
          break;
        case "setPrimary":
          setMessage("Transaction to make domain Primary in Progress");
          break;
        case "updateDomain":
          setMessage("Transaction to update domain Details in Progress");
          break;
        default:
          setMessage("Transaction In Progress");
          break;
      }
    } else {
      checkIsAssigned();
      checkIsPrimary();
      fetchDomainData();
    }
  }, [accountInfo.txTypeInProgress, current.chainId, domainName, sender]);

  const handleTabChange = (tabName: string) => {
    if (tabName === "properties")
      navigate("/fetch-name-service/domain-details/" + domainName);
    else window.open("https://www.fetns.domains/domains/" + domainName);
  };
  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={formatDomain(domainName)}
      onBackButton={useCallback(() => {
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
      {isLoading ? (
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
            {isMinted ? (isOwned ? "OWNED" : "BUY") : "AVAILABLE"}
          </div>
          <div className={style["description"]}>
            <textarea
              disabled={!isOwned || !FNS_CONFIG[current.chainId].isEditable}
              value={domainData.description || ""}
              style={{
                width: "330px",
                backgroundColor: "transparent",
                borderColor: "transparent",
                color: "white",
                textAlign: "center",
                resize: "none",
              }}
              onDragStart={(e) => e.preventDefault()}
              placeholder={
                isOwned
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
            />{" "}
          </div>
        </div>
        {isOwned && !domainData.address && (
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
                  disabled={!isOwned || !FNS_CONFIG[current.chainId].isEditable}
                  className={style["values"]}
                  value={domainData[property]}
                  onDragStart={(e) => e.preventDefault()}
                  placeholder={isOwned ? "Click to edit" : "Not Set"}
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

        {!isLoading &&
          (isOwned || isAssigned ? (
            <Update
              domainName={domainName}
              domainPrice={domainPrice}
              domainData={domainData}
              isOwned={isOwned}
              isAssigned={isAssigned}
              isPrimary={isPrimary}
              oldDomainData={oldDomainData}
            />
          ) : isMinted && !isOwned && !isAssigned ? (
            <BuyOrBid domainName={domainName} />
          ) : (
            <Mint domainPrice={domainPrice} domainName={domainName} />
          ))}
      </div>
      {showPopup && <MessagePopup message={message} />}
    </HeaderLayout>
  );
});
