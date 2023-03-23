import React, { FunctionComponent, useState } from "react";
import { useHistory } from "react-router";
import style from "./style.module.scss";

interface Props {
  newOrg: string[];
}
export const NewOrgMessage: FunctionComponent<Props> = (props) => {
  const [following, setFollowing] = useState(false);
  const { newOrg } = props;
  const viewAllOrg = newOrg.length !== 1;
  const history = useHistory();
  const handleFollow = () => {
    setFollowing(true);
  };

  const handleView = () => {
    history.push("notification/organizations/edit");
  };
  return (
    <div className={style.newOrgMsgContainer}>
      {!following ? (
        <>
          {" "}
          <div className={style.newOrgMsg}>
            <p className={style.newOrgName}>
              {viewAllOrg ? newOrg.length : newOrg[0]}
            </p>{" "}
            &nbsp;
            <p className={style.newOrgNote}>
              {viewAllOrg ? "organisations are" : "is"} new
            </p>
          </div>
          <div className={style.newOrgFollow}>
            {viewAllOrg ? (
              <p className={style.newOrgFollowLink} onClick={handleView}>
                View
              </p>
            ) : (
              <p className={style.newOrgFollowLink} onClick={handleFollow}>
                Follow
              </p>
            )}

            <img
              src={require("@assets/svg/cross-icon.svg")}
              className={style.newOrgCross}
            />
          </div>{" "}
        </>
      ) : (
        <>
          <div className={style.newOrgMsg}>
            {" "}
            <p className={style.newOrgNote}>Now following </p> &nbsp;{" "}
            <p className={style.newOrgName}>SomeOrg</p>
          </div>
        </>
      )}
    </div>
  );
};
