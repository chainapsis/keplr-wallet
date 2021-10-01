import React, { FunctionComponent, useEffect, useState } from "react";
import { Button, Col, CustomInput, Modal, ModalBody, Row } from "reactstrap";
import { Bech32Address } from "@keplr-wallet/cosmos";

import style from "./bip44-select-modal.module.scss";
import { useStore } from "../../stores";
import { observer } from "mobx-react-lite";
import { FormattedMessage } from "react-intl";
import { BIP44 } from "@keplr-wallet/types";
import { useLoadingIndicator } from "../../components/loading-indicator";
import { Dec } from "@keplr-wallet/unit";

const BIP44Selectable: FunctionComponent<{
  selectable: {
    path: BIP44;
    bech32Address: string;
  };
  selected: boolean;
  onSelect: () => void;
}> = observer(({ selectable, selected, onSelect }) => {
  const { chainStore, queriesStore } = useStore();
  const queries = queriesStore.get(chainStore.current.chainId);

  const account = queries.cosmos.queryAccount.getQueryBech32Address(
    selectable.bech32Address
  );
  const stakable = queries.queryBalances.getQueryBech32Address(
    selectable.bech32Address
  ).stakable;

  return (
    <div
      style={{ cursor: "pointer" }}
      onClick={(e) => {
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
                {Bech32Address.shortenAddress(selectable.bech32Address, 26)}
              </div>
            </Col>
          </Row>
          <Row>
            <Col>
              <div className={style.label}>
                <FormattedMessage id="main.modal.select-account.label.balance" />
              </div>
              <div className={style.value}>
                {stakable.balance
                  .trim(true)
                  .shrink(true)
                  .maxDecimals(6)
                  .toString()}
                {stakable.isFetching ? (
                  <i className="fas fa-spinner fa-spin ml-1" />
                ) : null}
              </div>
            </Col>
            <Col>
              <div className={style.label}>
                <FormattedMessage id="main.modal.select-account.label.sequence" />
              </div>
              <div className={style.value}>
                {account.sequence}
                {account.isFetching ? (
                  <i className="fas fa-spinner fa-spin ml-1" />
                ) : null}
              </div>
            </Col>
          </Row>
        </div>
      </CustomInput>
    </div>
  );
});

export const BIP44SelectModal: FunctionComponent = observer(() => {
  const { chainStore, keyRingStore, queriesStore } = useStore();
  const queries = queriesStore.get(chainStore.current.chainId);

  const selectables = keyRingStore.getKeyStoreSelectables(
    chainStore.current.chainId
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadingIndicator = useLoadingIndicator();
  useEffect(() => {
    if (selectables.isInitializing) {
      setIsModalOpen(false);
    } else if (!selectables.needSelectCoinType) {
      loadingIndicator.setIsLoading("bip44-selectables-init", false);
      setIsModalOpen(false);
    } else {
      // Wait to fetch the balances of the accounts.
      const queryBalancesWaiter = selectables.selectables
        .map((selectable) => {
          return queries.queryBalances.getQueryBech32Address(
            selectable.bech32Address
          ).balances;
        })
        .map((bals) => {
          return bals.map((bal) => {
            return bal.waitFreshResponse();
          });
        })
        // Flatten
        .reduce((pre, cur) => {
          return pre.concat(cur);
        }, []);

      // Wait to fetch the account.
      const queryAccountsWaiter = selectables.selectables
        .map((selectable) => {
          return queries.cosmos.queryAccount.getQueryBech32Address(
            selectable.bech32Address
          );
        })
        .map((account) => {
          return account.waitFreshResponse();
        });

      Promise.all([...queryBalancesWaiter, ...queryAccountsWaiter]).then(() => {
        // Assume that the first one as the main account of paths.
        const others = selectables.selectables.slice(1);

        // Check that the others have some balances/
        const hasBalances = others.find((other) => {
          const balances = queries.queryBalances.getQueryBech32Address(
            other.bech32Address
          ).balances;
          for (let i = 0; i < balances.length; i++) {
            const bal = balances[i];

            if (bal.balance.toDec().gt(new Dec(0))) {
              return true;
            }
          }

          return false;
        });

        // Check that the others have sent txs.
        const hasSequence = others.find((other) => {
          const account = queries.cosmos.queryAccount.getQueryBech32Address(
            other.bech32Address
          );
          return account.sequence !== "0";
        });

        // If there is no other accounts that have the balances or have sent txs,
        // just select the first account without requesting the users to select the account they want.
        if (!hasBalances && !hasSequence) {
          keyRingStore.setKeyStoreCoinType(
            chainStore.current.chainId,
            selectables.selectables[0].path.coinType
          );
        } else {
          setIsModalOpen(true);
        }

        loadingIndicator.setIsLoading("bip44-selectables-init", false);
      });
    }
  }, [
    chainStore,
    keyRingStore,
    loadingIndicator,
    queries,
    selectables.isInitializing,
    selectables.needSelectCoinType,
    selectables.selectables,
  ]);

  const [selectedCoinType, setSelectedCoinType] = useState(-1);

  return (
    <Modal
      isOpen={
        !selectables.isInitializing &&
        selectables.needSelectCoinType &&
        isModalOpen
      }
      centered
    >
      <ModalBody>
        <div className={style.title}>
          <FormattedMessage id="main.modal.select-account.title" />
        </div>
        <div>
          {selectables.selectables.map((selectable) => {
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
          disabled={selectedCoinType < 0}
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (selectedCoinType >= 0) {
              await keyRingStore.setKeyStoreCoinType(
                chainStore.current.chainId,
                selectedCoinType
              );
            }
          }}
        >
          <FormattedMessage id="main.modal.select-account.button.select" />
        </Button>
      </ModalBody>
    </Modal>
  );
});
