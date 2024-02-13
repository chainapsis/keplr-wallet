import { deleteGroup } from "@graphQL/groups-api";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import style from "./style.module.scss";
import { useStore } from "../../stores";

export const DeleteGroupPopup = ({
  setConfirmAction,
}: {
  setConfirmAction: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { analyticsStore } = useStore();

  const handleDelete = async () => {
    setProcessing(true);
    const groupId = location.pathname.split("/")[3];
    deleteGroup(groupId);
    setConfirmAction(false);
    analyticsStore.logEvent("delete_group_click", { action: "Delete" });
    navigate("/chat");
  };

  const handleCancel = () => {
    setConfirmAction(false);
  };

  return (
    <React.Fragment>
      <div className={style["overlay"]} />
      <div className={style["popup"]}>
        <h4>Delete Group</h4>
        <section>
          <p className={style["textContainer"]}>
            You will lose all your messages in this group. This action cannot be
            undone
          </p>
        </section>
        <div className={style["buttonContainer"]}>
          <button type="button" onClick={handleCancel} disabled={processing}>
            Cancel
          </button>
          <button
            type="button"
            className={style["btn"]}
            onClick={handleDelete}
            disabled={processing}
          >
            Delete
          </button>
        </div>
      </div>
    </React.Fragment>
  );
};
