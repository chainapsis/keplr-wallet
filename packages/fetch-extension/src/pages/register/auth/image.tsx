import React from "react";

export interface ImageProps {
  hoverImageId?: string;
  imageId: string;
  isButton?: boolean;
  height?: string;
  width?: string;
  image: string;
}

export const Image = (props: ImageProps) => {
  const { imageId, height = "auto", width = "auto", image } = props;

  return (
    <React.Fragment>
      <img
        src={image}
        height={height}
        width={width}
        alt={imageId}
        className="image-icon"
      />
    </React.Fragment>
  );
};
