import React, { useState } from "react";
import { Button } from "reactstrap";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperClass, { Navigation, Pagination } from "swiper";
import "swiper/swiper-bundle.min.css";
import style from "./style.module.scss";

export function Guide({ onScan }: { onScan(): void }) {
  const [stepIndex, setStepIndex] = useState(0);
  const onActiveIndexChange = (swiper: SwiperClass) => {
    setStepIndex(swiper.activeIndex);
  };

  return (
    <div className={`${style.page} ${style.guide}`}>
      <div className={style.steps}>
        <div className={style.title}>Tutorial</div>
        <Swiper
          navigation={{ prevEl: "#swiper-prev", nextEl: "#swiper-next" }}
          pagination={{ clickable: true, el: "#swiper-pagination" }}
          modules={[Navigation, Pagination]}
          onActiveIndexChange={onActiveIndexChange}
        >
          {[1, 2, 3].map((e: number) => (
            <SwiperSlide className={style.item} key={e}>
              <img
                src={require(`../../public/assets/img/keystone/tutorial${e}.png`)}
                width="285"
              />
            </SwiperSlide>
          ))}
          <div id="swiper-prev" className={style.prev}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10.6665 13.3333L5.6469 7.99992L10.6665 2.66659"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div id="swiper-next" className={style.next}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.3335 2.66675L10.3531 8.00008L5.3335 13.3334"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </Swiper>
        <div id="swiper-pagination" className={style.pagination} />
        {stepIndex === 0 && (
          <div className={style["swiper-title"]}>
            Tap <em>“Connect Software Wallet”</em> at the bottom left corner on
            the Keystone device.
          </div>
        )}
        {stepIndex === 1 && (
          <div className={style["swiper-title"]}>
            Select <em>“Keplr”</em> wallet.
          </div>
        )}
        {stepIndex === 2 && (
          <div className={style["swiper-title"]}>
            Click on the <em>“Scan the QR code”</em> button below to scan the QR
            code displayed on the Keystone device.
          </div>
        )}
        <div className={style.more}>
          <a
            href="https://support.keyst.one/3rd-party-wallets/cosmos-wallets/keplr-extension?utm_source=keplr&utm_medium=moredetails&utm_id=20230419"
            target="_blank"
            rel="noreferrer"
          >
            More Details
          </a>
        </div>
      </div>
      <div className={style.btns}>
        <Button color="primary" block onClick={onScan}>
          Scan the QR code
        </Button>
      </div>
    </div>
  );
}
