import React, { FunctionComponent, useEffect, useState } from "react";
import { Button, Col, CustomInput, Modal, ModalBody, Row } from "reactstrap";
import { shortenAddress } from "../../../../common/address";

import style from "./bip44-select-modal.module.scss";
import { SelectableAccount } from "../../../../background/keyring/types";
import { useStore } from "../../stores";
import { observer } from "mobx-react";
import { CoinUtils } from "../../../../common/coin-utils";
import { Int } from "@chainapsis/cosmosjs/common/int";
import { FormattedMessage } from "react-intl";

const BIP44Selectable: FunctionComponent<{
  selectable: SelectableAccount;
  selected: boolean;
  onSelect: () => void;
}> = observer(({ selectable, selected, onSelect }) => {
  const { chainStore } = useStore();

  const coin = selectable.coins.find(
    coin => coin.denom === chainStore.chainInfo.stakeCurrency.coinMinimalDenom
  );

  return (
    <div
      style={{ cursor: "pointer" }}
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();

        onSelect();
      }}
    >
      <CustomInput
        type="radio"
        id={`selectable-${selectable.bech32Address}`}
        checked={selected}
        onChange={() => {
          /* To prevent the readonly mode of `checked` prop, just set empty function */
        }}
      >
        <div className={style.selectable}>
          <div
            className={style.path}
          >{`m/44’/${selectable.path.coinType}’`}</div>
          <Row>
            <Col>
              <div className={style.label}>
                <FormattedMessage id="main.modal.select-account.label.address" />
              </div>
              <div className={style.value}>
                {shortenAddress(selectable.bech32Address, 26)}
              </div>
            </Col>
          </Row>
          <Row>
            <Col>
              <div className={style.label}>
                <FormattedMessage id="main.modal.select-account.label.balance" />
              </div>
              <div className={style.value}>
                {coin
                  ? CoinUtils.shrinkDecimals(
                      new Int(coin.amount),
                      chainStore.chainInfo.stakeCurrency.coinDecimals,
                      0,
                      4
                    )
                  : "0"}{" "}
                {chainStore.chainInfo.stakeCurrency.coinDenom}
              </div>
            </Col>
            <Col>
              <div className={style.label}>
                <FormattedMessage id="main.modal.select-account.label.sequence" />
              </div>
              <div className={style.value}>{selectable.sequence}</div>
            </Col>
          </Row>
        </div>
      </CustomInput>
    </div>
  );
});

export const BIP44SelectModal: FunctionComponent<{
  enabled: boolean;
  accounts: SelectableAccount[];
}> = observer(({ enabled, accounts }) => {
  const { chainStore, keyRingStore } = useStore();

  const [selectedCoinType, setSelectedCoinType] = useState(-1);

  useEffect(() => {
    if (selectedCoinType === -1 && accounts.length > 0) {
      setSelectedCoinType(accounts[0].path.coinType);
    }
  }, [accounts, selectedCoinType]);

  const select = async () => {
    if (selectedCoinType !== -1) {
      await keyRingStore.setKeyStoreCoinType(
        chainStore.chainInfo.chainId,
        selectedCoinType
      );
    }
  };

  return (
    <Modal isOpen={enabled && accounts.length > 0} centered>
      <ModalBody>
        <div className={style.title}>
          <FormattedMessage id="main.modal.select-account.title" />
        </div>
        <div>
          {accounts.map(selectable => {
            return (
              <BIP44Selectable
                key={selectable.bech32Address}
                selectable={selectable}
                selected={selectedCoinType === selectable.path.coinType}
                onSelect={() => {
                  setSelectedCoinType(selectable.path.coinType);
                }}
              />
            );
          })}
        </div>
        <Button
          type="button"
          color="primary"
          block
          style={{ marginTop: "10px" }}
          onClick={async e => {
            e.preventDefault();
            e.stopPropagation();

            await select();
          }}
        >
          <FormattedMessage id="main.modal.select-account.button.select" />
        </Button>
      </ModalBody>
    </Modal>
  );
});
