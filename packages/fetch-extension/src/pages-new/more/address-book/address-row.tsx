import React from "react";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { shortenAgentAddress } from "@utils/validate-agent";
import { Card } from "@components-v2/card";

interface AddressRowProps {
  data: any;
  index: number;
  onSelect: (index: number) => void;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  selectedChainId: any;
  chainStore: any;
  selectHandler: any;
}

export const AddressRow: React.FC<AddressRowProps> = ({
  selectHandler,
  chainStore,
  selectedChainId,
  data,
  index,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const handleAddressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!data.address.startsWith("agent")) {
      onSelect(index);
    }
  };

  const handleEditClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(index);
  };

  const handleDeleteClick = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(index);
  };

  return (
    <Card
      key={index.toString()}
      heading={data.name}
      subheading={
        data.address.indexOf(
          chainStore.getChain(selectedChainId).bech32Config.bech32PrefixAccAddr
        ) === 0
          ? Bech32Address.shortenAddress(data.address, 34)
          : data.address.startsWith("agent")
          ? shortenAgentAddress(data.address)
          : Bech32Address.shortenAddress(data.address, 34, true)
      }
      rightContent={
        <div style={{ display: "flex", gap: "5px" }}>
          <img
            src={require("@assets/svg/edit-icon.svg")}
            draggable={false}
            style={{ cursor: "pointer" }}
            onClick={handleEditClick}
          />
          <img
            src={require("@assets/svg/trash-icon.svg")}
            draggable={false}
            style={{ cursor: "pointer" }}
            onClick={handleDeleteClick}
          />
        </div>
      }
      data-index={index}
      rightContentStyle={{ display: "flex", gap: "5px" }}
      onClick={handleAddressClick}
      style={{
        cursor: selectHandler ? undefined : "auto",
        background: "rgba(255,255,255,0.1)",
      }}
    />
  );
};
