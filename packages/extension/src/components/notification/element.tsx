import React, { FunctionComponent, useEffect } from "react";

import { Alert } from "reactstrap";

export interface NotificationElementProps {
  type:
    | "primary"
    | "link"
    | "info"
    | "success"
    | "warning"
    | "danger"
    | "default"
    | "secondary";
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
  }, [duration, onDelete]);

  return (
    <Alert
      className={type === "default" ? "alert-default" : undefined}
      color={type !== "default" ? type : undefined}
      fade={false}
      toggle={canDelete ? onDelete : undefined}
    >
      <span className="alert-inner--text">{content}</span>
    </Alert>
  );
};
