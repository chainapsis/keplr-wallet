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
    <div className={style.page}>
      <div className={style.steps}>
        <div className={style.title}>Tutorial</div>
        <Swiper
          navigation={{ prevEl: "#swiper-prev", nextEl: "#swiper-next" }}
          pagination={{ clickable: true, el: "#swiper-pagination" }}
          modules={[Navigation, Pagination]}
          onActiveIndexChange={onActiveIndexChange}
        >
          {[1, 2, 3, 4].map((e: number) => (
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
            Select the <em>Cosmos</em> option in the “Software Wallet” menu
            available in your Keystone
          </div>
        )}
        {stepIndex === 1 && (
          <div className={style["swiper-title"]}>
            Tap the icon “ <em>…</em> ” on the top right corner
          </div>
        )}
        {stepIndex === 2 && (
          <div className={style["swiper-title"]}>
            Select <em>Connect Software Wallet</em>
          </div>
        )}
        {stepIndex === 3 && (
          <div className={style["swiper-title"]}>
            Click <em>Scan</em> button below and scan the QR code on the
            Keystone device
          </div>
        )}
        <div className={style.more}>
          <a href="/" target="_blank">
            More Details
          </a>
        </div>
      </div>
      <Button
        color={stepIndex === 3 ? "primary" : "secondary"}
        block
        onClick={onScan}
      >
        {stepIndex === 3 ? "Scan the QR code" : "Skip to scan"}
      </Button>
    </div>
  );
}
