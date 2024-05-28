import React, { FunctionComponent, useMemo } from "react";

import style from "../../style.module.scss";
import { useNavigate } from "react-router";
import { observer } from "mobx-react-lite";
import { useStore } from "../../../../stores";
import { useIntl } from "react-intl";
import { useConfirm } from "@components/confirm";
import { HeaderLayout } from "@layouts-v2/header-layout";
import { Card } from "@components-v2/card";
import { formatString } from "@utils/format";

export const SettingConnectionsPage: FunctionComponent = observer(() => {
  const navigate = useNavigate();
  const intl = useIntl();

  const { chainStore, permissionStore, analyticsStore } = useStore();
  const selectedChainId = chainStore.current.chainId;

  const basicAccessInfo = permissionStore.getBasicAccessInfo(selectedChainId);

  // const [dropdownOpen, setOpen] = useState(false);
  // const toggle = () => setOpen(!dropdownOpen);

  const confirm = useConfirm();

  const xIcon = useMemo(
    () => [<i key="remove" className="fas fa-times" />],
    []
  );

  return (
    <HeaderLayout
      showTopMenu={true}
      showChainName={false}
      canChangeChainInfo={false}
      smallTitle={true}
      showBottomMenu={false}
      alternativeTitle={intl.formatMessage({
        id: "setting.connections",
      })}
      onBackButton={() => {
        analyticsStore.logEvent("back_click", {
          pageName: "Wallet Access Permissions",
        });

        navigate(-1);
      }}
    >
      <div className={style["container"]}>
        {basicAccessInfo.origins.map((origin) => {
          return (
            <Card
              style={{ background: "rgba(255,255,255,0.1)" }}
              heading={formatString(origin)}
              key={origin}
              onClick={async (e: { preventDefault: () => void }) => {
                e.preventDefault();

                if (
                  await confirm.confirm({
                    img: (
                      <img
                        alt="unlink"
                        src={require("@assets/img/broken-link.svg")}
                        style={{ height: "80px" }}
                      />
                    ),
                    title: intl.formatMessage({
                      id: "setting.connections.confirm.delete-connection.title",
                    }),
                    paragraph: intl.formatMessage({
                      id: "setting.connections.confirm.delete-connection.paragraph",
                    }),
                  })
                ) {
                  await basicAccessInfo.removeOrigin(origin);
                }
              }}
              rightContent={xIcon}
            />
          );
        })}
      </div>
    </HeaderLayout>
  );
});
