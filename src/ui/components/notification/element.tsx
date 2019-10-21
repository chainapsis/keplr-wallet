import React, { FunctionComponent, useEffect } from "react";
import classnames from "classnames";

export interface NotificationElementProps {
  type: "primary" | "link" | "info" | "success" | "warning" | "danger";
  content: string;
  duration: number; // Seconds
  canDelete?: boolean;
}

export const NotificationElement: FunctionComponent<
  NotificationElementProps & {
    onDelete: () => void;
  }
> = ({ type, content, duration, canDelete, onDelete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDelete();
    }, duration * 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={classnames("notification", `is-${type}`)}>
      {canDelete ? <button className="delete" onClick={onDelete} /> : null}
      {content}
    </div>
  );
};
