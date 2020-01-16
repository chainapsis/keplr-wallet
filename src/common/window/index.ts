const PopupSize = {
  width: 360,
  height: 580
};

export function openWindow(url: string) {
  window.open(
    url,
    "Keplr",
    `width=${PopupSize.width}px,height=${PopupSize.height}px,scrollbars=0`,
    true
  );
}

/**
 * window.open() has many options for sizing, but they require different ways to do this per web browser.
 * So, to avoid this problem, just manually set sizing if new window popup is opened.
 */
export function fitWindow() {
  // Get the gap size like title bar or menu bar, etc...
  const gap = {
    width: window.outerWidth - window.innerWidth,
    height: window.outerHeight - window.innerHeight
  };

  window.resizeTo(PopupSize.width + gap.width, PopupSize.height + gap.height);
}

/**
 * In some case, opened window has scrollbar even if scroll is unnecessary.
 * This can spoil the layout of content slightly.
 * So, if you are sure you don't need scrolling, use this function to remove scrolling.
 */
export function disableScroll() {
  const html = document.getElementsByTagName("html");
  html[0].style.overflow = "hidden";
}

export function enableScroll() {
  const html = document.getElementsByTagName("html");
  html[0].style.overflow = "";
}
