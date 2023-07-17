import domainImage from "@assets/icon/domain-image.png";
import { HeaderLayout } from "@new-layouts";
import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import {
  getDomainData,
  getDomainPrice,
  getDomainStatus,
} from "../../../name-service/fns-apis";
import { useStore } from "../../../stores";
import { BuyOrBid } from "./buy-or-bid";
import { MakePrimary } from "./make-primary";
import { Mint } from "./mint";
import style from "./style.module.scss";

export const DomainDetails = () => {
  const history = useHistory();
  const location = useLocation();
  const domainName = (location.state as { domainName: string })?.domainName;
  const { accountStore, chainStore } = useStore();
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);
  const sender = accountInfo.bech32Address;

  const [selectedDomain, setSelectedDomain] = useState<any>(null);
  const [selectedDomainPrice, setSelectedDomainPrice] = useState<any>(null);
  const [isMinted, setIsMinted] = useState<any>(null);
  const [isOwned, setIsOwned] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    const fetchDomainData = async () => {
      try {
        setIsLoading(true);
        const fetchedDomainData = await getDomainData(
          current.chainId,
          domainName
        );
        setSelectedDomain(fetchedDomainData);
        const isDomainMinted = await getDomainStatus(
          current.chainId,
          domainName
        );
        const fetchDomainPrice = await getDomainPrice(
          current.chainId,
          domainName
        );
        setSelectedDomainPrice(fetchDomainPrice);
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
        console.error("Error fetching domain data:", error);
      }
    };

    fetchDomainData();
  }, [domainName]);

  const propertiesToIterate = [
    "address",
    "email",
    "github",
    "website",
    "twitter",
    "background",
  ];

  const handleCancelClick = () => {
    setShowCard(false);
  };

  return (
    <HeaderLayout
      showChainName={false}
      canChangeChainInfo={false}
      alternativeTitle={domainName.toUpperCase()}
      onBackButton={() => {
        history.goBack();
      }}
      showBottomMenu={true}
    >
      <div className={style.bgBiur}>
        <div className={style.bgBiurChild} />
        <div className={style.bgBiurItem} />
      </div>
      <div style={{ zIndex: 2, position: "relative" }}>
        <div className={style.header}>PROPERTIES</div>

        {isLoading ? (
          <div className={style.loader}>
            Loading Domain Info <i className="fas fa-spinner fa-spin ml-2" />
          </div>
        ) : (
          <React.Fragment>
            <div className={style.domainIntro}>
              {selectedDomain.domain_data.background ? (
                <img
                  style={{ height: "130px" }}
                  src={selectedDomain.domain_data.background}
                  alt="Domain Image"
                />
              ) : (
                <React.Fragment>
                  <img
                    style={{ height: "130px" }}
                    src={domainImage}
                    alt="Domain Image"
                  />
                  <div className={style.imageText}>
                    {domainName.toUpperCase()}
                  </div>
                </React.Fragment>
              )}
              <div className={style.availability}>
                {isMinted ? (isOwned ? "OWNED" : "BUY") : "AVAILABLE"}
              </div>
              <div className={style.description}>
                {selectedDomain.domain_data?.description ||
                  "Description hasn't been set"}
              </div>
            </div>

            {propertiesToIterate.map((property) => (
              <div className={style.domainInfo} key={property}>
                <div className={style.keys}>{property}</div>
                <div className={style.values}>
                  {selectedDomain.domain_data[property] || "Not set"}
                </div>
              </div>
            ))}
            <a
              href={`https://www.fetns.domains/domains/${domainName}`}
              target="_blank"
              rel="noreferrer"
              className={style.moreDetails}
            >
              <div>See More Details</div>
              <img
                className={style.arrowIcon}
                src={require("@assets/svg/arrow-right-outline.svg")}
                alt=""
              />
            </a>

            {!isLoading &&
              (isOwned ? (
                <MakePrimary
                  sender={sender}
                  domainName={domainName}
                  setError={setError}
                  setShowCard={setShowCard}
                />
              ) : isMinted ? (
                <BuyOrBid domainName={domainName} />
              ) : (
                <Mint
                  domainPrice={selectedDomainPrice}
                  domainName={domainName}
                  setError={setError}
                  setShowCard={setShowCard}
                />
              ))}
          </React.Fragment>
        )}
      </div>

      {showCard && error && (
        <React.Fragment>
          <div
            className={style.errorCard}
            onClick={() => handleCancelClick()}
          />
          <div className={style.popupCard}>
            <div className={style.errorText}>
              <h3 style={{ color: "white" }}>Transaction Failed!</h3>
            </div>
            <button type="button" onClick={() => handleCancelClick()}>
              cancel
            </button>
          </div>
        </React.Fragment>
      )}
    </HeaderLayout>
  );
};
