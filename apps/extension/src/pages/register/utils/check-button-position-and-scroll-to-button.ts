export const checkButtonPositionAndScrollToButton = (
  buttonContainerRef: React.RefObject<HTMLDivElement>
) => {
  if (buttonContainerRef.current) {
    const rect = buttonContainerRef.current.getBoundingClientRect();
    const isOffscreen = rect.bottom - rect.height / 2 > window.innerHeight;
    console.log(
      "isOffscreen",
      isOffscreen,
      rect.bottom,
      window.innerHeight,
      buttonContainerRef.current.offsetHeight,
      buttonContainerRef.current.offsetTop,
      rect.height
    );

    if (isOffscreen) {
      buttonContainerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }
};
