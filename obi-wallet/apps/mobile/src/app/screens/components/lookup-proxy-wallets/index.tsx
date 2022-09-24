import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Linking, TouchableOpacity, View } from "react-native";
import { Text } from "@obi-wallet/common";
import { SafeAreaView } from "react-native-safe-area-context";
import { Background } from "../background";
import { FormattedMessage } from "react-intl";
import { IconButton } from "../../../button";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { faShare } from "@fortawesome/free-solid-svg-icons/faShare";
import { Bech32Address } from "@keplr-wallet/cosmos";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { faCircle } from "@fortawesome/free-regular-svg-icons";
import { VerifyAndProceedButton } from "../phone-number/verify-and-proceed-button";

export interface LookupProxyWalletsProps {
  address: string;
  onSelect(wallet: Wallet): void;
  onCancel(): void;
}

export const LookupProxyWallets = observer<LookupProxyWalletsProps>(
  ({ address, onSelect, onCancel }) => {
    const [wallets, setWallets] = useState<Wallet[] | null>(null);
    const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);

    useEffect(() => {
      (async () => {
        try {
          console.log(getUrl(address));
          // const response = await fetch(getUrl(address));
          // console.log(await response.json());

          const response = {
            jsonrpc: "2.0",
            id: -1,
            result: {
              txs: [
                {
                  hash: "EEEA24B902215345DF366C38E333E0632EB3FB891E8A978B9EFAB18A4BF9E03A",
                  height: "4936229",
                  index: 3,
                  tx_result: {
                    code: 0,
                    data: "Cm0KKC9jb3Ntd2FzbS53YXNtLnYxLk1zZ0luc3RhbnRpYXRlQ29udHJhY3QSQQo/anVubzFubW13cndmamNkNWtoeDR3OHk3c2F2eGY3aDAzaGVyZDV0NXFnN2Y5ODVmbXJzMzh5M3JxMHQ0N2E0",
                    log: '[{"events":[{"type":"instantiate","attributes":[{"key":"_contract_address","value":"juno1nmmwrwfjcd5khx4w8y7savxf7h03herd5t5qg7f985fmrs38y3rq0t47a4"},{"key":"code_id","value":"1057"}]},{"type":"message","attributes":[{"key":"action","value":"/cosmwasm.wasm.v1.MsgInstantiateContract"},{"key":"module","value":"wasm"},{"key":"sender","value":"juno1wkvgv9r7gp3wl4xdlgcn8ppra5hlawx0vsqv9d"}]},{"type":"wasm-obisign","attributes":[{"key":"_contract_address","value":"juno1nmmwrwfjcd5khx4w8y7savxf7h03herd5t5qg7f985fmrs38y3rq0t47a4"},{"key":"signer","value":"juno1kzepe4jaw3c4jzf7f9delcu3kwxg98f36cajae"},{"key":"signer","value":"juno1eq7u3awntvfeye3dx66xdvx4xrckgnrkvr3l2e"},{"key":"signer","value":"juno17w77rnps59cnallfskg42s3ntnlhrzu2mjkr3e"}]}]}]',
                    info: "",
                    gas_wanted: "1280000",
                    gas_used: "206503",
                    events: [
                      {
                        type: "coin_spent",
                        attributes: [
                          {
                            key: "c3BlbmRlcg==",
                            value:
                              "anVubzF3a3ZndjlyN2dwM3dsNHhkbGdjbjhwcHJhNWhsYXd4MHZzcXY5ZA==",
                            index: false,
                          },
                          {
                            key: "YW1vdW50",
                            value: "NjAwMHVqdW5v",
                            index: false,
                          },
                        ],
                      },
                      {
                        type: "coin_received",
                        attributes: [
                          {
                            key: "cmVjZWl2ZXI=",
                            value:
                              "anVubzE3eHBmdmFrbTJhbWc5NjJ5bHM2Zjg0ejNrZWxsOGM1bHh0cW12cA==",
                            index: false,
                          },
                          {
                            key: "YW1vdW50",
                            value: "NjAwMHVqdW5v",
                            index: false,
                          },
                        ],
                      },
                      {
                        type: "transfer",
                        attributes: [
                          {
                            key: "cmVjaXBpZW50",
                            value:
                              "anVubzE3eHBmdmFrbTJhbWc5NjJ5bHM2Zjg0ejNrZWxsOGM1bHh0cW12cA==",
                            index: false,
                          },
                          {
                            key: "c2VuZGVy",
                            value:
                              "anVubzF3a3ZndjlyN2dwM3dsNHhkbGdjbjhwcHJhNWhsYXd4MHZzcXY5ZA==",
                            index: false,
                          },
                          {
                            key: "YW1vdW50",
                            value: "NjAwMHVqdW5v",
                            index: false,
                          },
                        ],
                      },
                      {
                        type: "message",
                        attributes: [
                          {
                            key: "c2VuZGVy",
                            value:
                              "anVubzF3a3ZndjlyN2dwM3dsNHhkbGdjbjhwcHJhNWhsYXd4MHZzcXY5ZA==",
                            index: false,
                          },
                        ],
                      },
                      {
                        type: "tx",
                        attributes: [
                          {
                            key: "ZmVl",
                            value: "NjAwMHVqdW5v",
                            index: false,
                          },
                        ],
                      },
                      {
                        type: "tx",
                        attributes: [
                          {
                            key: "YWNjX3NlcQ==",
                            value:
                              "anVubzF3a3ZndjlyN2dwM3dsNHhkbGdjbjhwcHJhNWhsYXd4MHZzcXY5ZC8x",
                            index: false,
                          },
                        ],
                      },
                      {
                        type: "tx",
                        attributes: [
                          {
                            key: "c2lnbmF0dXJl",
                            value:
                              "bGY3MFFPMEdFK3pRT3BvenErSG85MURWYnZQZVk4b2lvcDYrTXNYL2RqOHQwbHRqRDhvc0J1aU1PU1ZBQm5BZnhYci9Od1hMYkRKTVhINklicTMxeEE9PQ==",
                            index: false,
                          },
                        ],
                      },
                      {
                        type: "tx",
                        attributes: [
                          {
                            key: "c2lnbmF0dXJl",
                            value:
                              "Q2tDVi92UkE3UVlUN05BNm1qT3I0ZWozVU5WdTg5NWp5aUtpbnI0eXhmOTJQeTNTVzJNUHlpd0c2SXc1SlVBR2NCL0ZldjgzQmN0c01reGNmb2h1cmZYRQ==",
                            index: false,
                          },
                        ],
                      },
                      {
                        type: "message",
                        attributes: [
                          {
                            key: "YWN0aW9u",
                            value:
                              "L2Nvc213YXNtLndhc20udjEuTXNnSW5zdGFudGlhdGVDb250cmFjdA==",
                            index: false,
                          },
                        ],
                      },
                      {
                        type: "message",
                        attributes: [
                          {
                            key: "bW9kdWxl",
                            value: "d2FzbQ==",
                            index: false,
                          },
                          {
                            key: "c2VuZGVy",
                            value:
                              "anVubzF3a3ZndjlyN2dwM3dsNHhkbGdjbjhwcHJhNWhsYXd4MHZzcXY5ZA==",
                            index: false,
                          },
                        ],
                      },
                      {
                        type: "instantiate",
                        attributes: [
                          {
                            key: "X2NvbnRyYWN0X2FkZHJlc3M=",
                            value:
                              "anVubzFubW13cndmamNkNWtoeDR3OHk3c2F2eGY3aDAzaGVyZDV0NXFnN2Y5ODVmbXJzMzh5M3JxMHQ0N2E0",
                            index: false,
                          },
                          {
                            key: "Y29kZV9pZA==",
                            value: "MTA1Nw==",
                            index: false,
                          },
                        ],
                      },
                      {
                        type: "wasm-obisign",
                        attributes: [
                          {
                            key: "X2NvbnRyYWN0X2FkZHJlc3M=",
                            value:
                              "anVubzFubW13cndmamNkNWtoeDR3OHk3c2F2eGY3aDAzaGVyZDV0NXFnN2Y5ODVmbXJzMzh5M3JxMHQ0N2E0",
                            index: false,
                          },
                          {
                            key: "c2lnbmVy",
                            value:
                              "anVubzFremVwZTRqYXczYzRqemY3ZjlkZWxjdTNrd3hnOThmMzZjYWphZQ==",
                            index: true,
                          },
                          {
                            key: "c2lnbmVy",
                            value:
                              "anVubzFlcTd1M2F3bnR2ZmV5ZTNkeDY2eGR2eDR4cmNrZ25ya3ZyM2wyZQ==",
                            index: true,
                          },
                          {
                            key: "c2lnbmVy",
                            value:
                              "anVubzE3dzc3cm5wczU5Y25hbGxmc2tnNDJzM250bmxocnp1Mm1qa3IzZQ==",
                            index: true,
                          },
                        ],
                      },
                    ],
                    codespace: "",
                  },
                  tx: "CvADCu0DCigvY29zbXdhc20ud2FzbS52MS5Nc2dJbnN0YW50aWF0ZUNvbnRyYWN0EsADCitqdW5vMXdrdmd2OXI3Z3Azd2w0eGRsZ2NuOHBwcmE1aGxhd3gwdnNxdjlkEitqdW5vMXdrdmd2OXI3Z3Azd2w0eGRsZ2NuOHBwcmE1aGxhd3gwdnNxdjlkGKEIIglPYmkgUHJveHkq1QJ7ImFkbWluIjoianVubzF3a3ZndjlyN2dwM3dsNHhkbGdjbjhwcHJhNWhsYXd4MHZzcXY5ZCIsImhvdF93YWxsZXRzIjpbXSwidXVzZF9mZWVfZGVidCI6IjUwMDAwMCIsImZlZV9sZW5kX3JlcGF5X3dhbGxldCI6Imp1bm8xcnVmdGFkNmV5dG1yM3F6bWY5azNleWE5YWg4aHNudmt1amtlajgiLCJob21lX25ldHdvcmsiOiJqdW5vLTEiLCJzaWduZXJzIjpbImp1bm8xa3plcGU0amF3M2M0anpmN2Y5ZGVsY3Uza3d4Zzk4ZjM2Y2FqYWUiLCJqdW5vMWVxN3UzYXdudHZmZXllM2R4NjZ4ZHZ4NHhyY2tnbnJrdnIzbDJlIiwianVubzE3dzc3cm5wczU5Y25hbGxmc2tnNDJzM250bmxocnp1Mm1qa3IzZSJdfRK2AgqeAgqIAgopL2Nvc21vcy5jcnlwdG8ubXVsdGlzaWcuTGVnYWN5QW1pbm9QdWJLZXkS2gEIARJGCh8vY29zbW9zLmNyeXB0by5zZWNwMjU2azEuUHViS2V5EiMKIQIxqrSQnUIQsxSDUAHozgtLD9GuuXhlz+x9g/zyWZ74kBJGCh8vY29zbW9zLmNyeXB0by5zZWNwMjU2azEuUHViS2V5EiMKIQPnlWC8kkxjKeAyLF9L8c3+pB+XZUJFBLbZa6yKU36quRJGCh8vY29zbW9zLmNyeXB0by5zZWNwMjU2azEuUHViS2V5EiMKIQNIZTFOjqFWB7h77cMB26Vk9pPiVREDuDSukDcT/cS0ihIPEg0KBQgDEgGAEgQKAgh/GAESEwoNCgV1anVubxIENjAwMBCAkE4aQgpAlf70QO0GE+zQOpozq+Ho91DVbvPeY8oiop6+MsX/dj8t0ltjD8osBuiMOSVABnAfxXr/NwXLbDJMXH6Ibq31xA==",
                },
                {
                  hash: "54FE967B05D5E58F38796981A594F1FBB2A2E2F6FC9EBEE13267E5E9677418B8",
                  height: "4936340",
                  index: 3,
                  tx_result: {
                    code: 0,
                    data: "Cm0KKC9jb3Ntd2FzbS53YXNtLnYxLk1zZ0luc3RhbnRpYXRlQ29udHJhY3QSQQo/anVubzE3cnBmZDdnd3h5d3RhZWh0YW54NjNqcmhqaGh1emVoNDl4M2o4MGh0NHo0cWN3ZXQ2NTRxY3c1MnBy",
                    log: '[{"events":[{"type":"instantiate","attributes":[{"key":"_contract_address","value":"juno17rpfd7gwxywtaehtanx63jrhjhhuzeh49x3j80ht4z4qcwet654qcw52pr"},{"key":"code_id","value":"1057"}]},{"type":"message","attributes":[{"key":"action","value":"/cosmwasm.wasm.v1.MsgInstantiateContract"},{"key":"module","value":"wasm"},{"key":"sender","value":"juno1wkvgv9r7gp3wl4xdlgcn8ppra5hlawx0vsqv9d"}]},{"type":"wasm-obisign","attributes":[{"key":"_contract_address","value":"juno17rpfd7gwxywtaehtanx63jrhjhhuzeh49x3j80ht4z4qcwet654qcw52pr"},{"key":"signer","value":"juno1kzepe4jaw3c4jzf7f9delcu3kwxg98f36cajae"},{"key":"signer","value":"juno1eq7u3awntvfeye3dx66xdvx4xrckgnrkvr3l2e"},{"key":"signer","value":"juno17w77rnps59cnallfskg42s3ntnlhrzu2mjkr3e"}]}]}]',
                    info: "",
                    gas_wanted: "1280000",
                    gas_used: "206152",
                    events: [
                      {
                        type: "coin_spent",
                        attributes: [
                          {
                            key: "c3BlbmRlcg==",
                            value:
                              "anVubzF3a3ZndjlyN2dwM3dsNHhkbGdjbjhwcHJhNWhsYXd4MHZzcXY5ZA==",
                            index: false,
                          },
                          {
                            key: "YW1vdW50",
                            value: "NjAwMHVqdW5v",
                            index: false,
                          },
                        ],
                      },
                      {
                        type: "coin_received",
                        attributes: [
                          {
                            key: "cmVjZWl2ZXI=",
                            value:
                              "anVubzE3eHBmdmFrbTJhbWc5NjJ5bHM2Zjg0ejNrZWxsOGM1bHh0cW12cA==",
                            index: false,
                          },
                          {
                            key: "YW1vdW50",
                            value: "NjAwMHVqdW5v",
                            index: false,
                          },
                        ],
                      },
                      {
                        type: "transfer",
                        attributes: [
                          {
                            key: "cmVjaXBpZW50",
                            value:
                              "anVubzE3eHBmdmFrbTJhbWc5NjJ5bHM2Zjg0ejNrZWxsOGM1bHh0cW12cA==",
                            index: false,
                          },
                          {
                            key: "c2VuZGVy",
                            value:
                              "anVubzF3a3ZndjlyN2dwM3dsNHhkbGdjbjhwcHJhNWhsYXd4MHZzcXY5ZA==",
                            index: false,
                          },
                          {
                            key: "YW1vdW50",
                            value: "NjAwMHVqdW5v",
                            index: false,
                          },
                        ],
                      },
                      {
                        type: "message",
                        attributes: [
                          {
                            key: "c2VuZGVy",
                            value:
                              "anVubzF3a3ZndjlyN2dwM3dsNHhkbGdjbjhwcHJhNWhsYXd4MHZzcXY5ZA==",
                            index: false,
                          },
                        ],
                      },
                      {
                        type: "tx",
                        attributes: [
                          {
                            key: "ZmVl",
                            value: "NjAwMHVqdW5v",
                            index: false,
                          },
                        ],
                      },
                      {
                        type: "tx",
                        attributes: [
                          {
                            key: "YWNjX3NlcQ==",
                            value:
                              "anVubzF3a3ZndjlyN2dwM3dsNHhkbGdjbjhwcHJhNWhsYXd4MHZzcXY5ZC84",
                            index: false,
                          },
                        ],
                      },
                      {
                        type: "tx",
                        attributes: [
                          {
                            key: "c2lnbmF0dXJl",
                            value:
                              "ZjNiazZPcndRY2RVeWttRlVOczJlaFNhaksrY2thMy9SRUx5Y2NYY3BlUjFVSUxROXlYcWpjdEQrMEtJU1ljY253WVhXT013YnJiM29VenlrWUVSL0E9PQ==",
                            index: false,
                          },
                        ],
                      },
                      {
                        type: "tx",
                        attributes: [
                          {
                            key: "c2lnbmF0dXJl",
                            value:
                              "Q2tCL2R1VG82dkJCeDFUS1NZVlEyelo2RkpxTXI1eVJyZjlFUXZKeHhkeWw1SFZRZ3REM0plcU55MFA3UW9oSmh4eWZCaGRZNHpCdXR2ZWhUUEtSZ1JIOA==",
                            index: false,
                          },
                        ],
                      },
                      {
                        type: "message",
                        attributes: [
                          {
                            key: "YWN0aW9u",
                            value:
                              "L2Nvc213YXNtLndhc20udjEuTXNnSW5zdGFudGlhdGVDb250cmFjdA==",
                            index: false,
                          },
                        ],
                      },
                      {
                        type: "message",
                        attributes: [
                          {
                            key: "bW9kdWxl",
                            value: "d2FzbQ==",
                            index: false,
                          },
                          {
                            key: "c2VuZGVy",
                            value:
                              "anVubzF3a3ZndjlyN2dwM3dsNHhkbGdjbjhwcHJhNWhsYXd4MHZzcXY5ZA==",
                            index: false,
                          },
                        ],
                      },
                      {
                        type: "instantiate",
                        attributes: [
                          {
                            key: "X2NvbnRyYWN0X2FkZHJlc3M=",
                            value:
                              "anVubzE3cnBmZDdnd3h5d3RhZWh0YW54NjNqcmhqaGh1emVoNDl4M2o4MGh0NHo0cWN3ZXQ2NTRxY3c1MnBy",
                            index: false,
                          },
                          {
                            key: "Y29kZV9pZA==",
                            value: "MTA1Nw==",
                            index: false,
                          },
                        ],
                      },
                      {
                        type: "wasm-obisign",
                        attributes: [
                          {
                            key: "X2NvbnRyYWN0X2FkZHJlc3M=",
                            value:
                              "anVubzE3cnBmZDdnd3h5d3RhZWh0YW54NjNqcmhqaGh1emVoNDl4M2o4MGh0NHo0cWN3ZXQ2NTRxY3c1MnBy",
                            index: false,
                          },
                          {
                            key: "c2lnbmVy",
                            value:
                              "anVubzFremVwZTRqYXczYzRqemY3ZjlkZWxjdTNrd3hnOThmMzZjYWphZQ==",
                            index: true,
                          },
                          {
                            key: "c2lnbmVy",
                            value:
                              "anVubzFlcTd1M2F3bnR2ZmV5ZTNkeDY2eGR2eDR4cmNrZ25ya3ZyM2wyZQ==",
                            index: true,
                          },
                          {
                            key: "c2lnbmVy",
                            value:
                              "anVubzE3dzc3cm5wczU5Y25hbGxmc2tnNDJzM250bmxocnp1Mm1qa3IzZQ==",
                            index: true,
                          },
                        ],
                      },
                    ],
                    codespace: "",
                  },
                  tx: "CusDCugDCigvY29zbXdhc20ud2FzbS52MS5Nc2dJbnN0YW50aWF0ZUNvbnRyYWN0ErsDCitqdW5vMXdrdmd2OXI3Z3Azd2w0eGRsZ2NuOHBwcmE1aGxhd3gwdnNxdjlkEitqdW5vMXdrdmd2OXI3Z3Azd2w0eGRsZ2NuOHBwcmE1aGxhd3gwdnNxdjlkGKEIIglPYmkgUHJveHkq0AJ7ImFkbWluIjoianVubzF3a3ZndjlyN2dwM3dsNHhkbGdjbjhwcHJhNWhsYXd4MHZzcXY5ZCIsImhvdF93YWxsZXRzIjpbXSwidXVzZF9mZWVfZGVidCI6IjAiLCJmZWVfbGVuZF9yZXBheV93YWxsZXQiOiJqdW5vMXJ1ZnRhZDZleXRtcjNxem1mOWszZXlhOWFoOGhzbnZrdWprZWo4IiwiaG9tZV9uZXR3b3JrIjoianVuby0xIiwic2lnbmVycyI6WyJqdW5vMWt6ZXBlNGphdzNjNGp6ZjdmOWRlbGN1M2t3eGc5OGYzNmNhamFlIiwianVubzFlcTd1M2F3bnR2ZmV5ZTNkeDY2eGR2eDR4cmNrZ25ya3ZyM2wyZSIsImp1bm8xN3c3N3JucHM1OWNuYWxsZnNrZzQyczNudG5saHJ6dTJtamtyM2UiXX0StgIKngIKiAIKKS9jb3Ntb3MuY3J5cHRvLm11bHRpc2lnLkxlZ2FjeUFtaW5vUHViS2V5EtoBCAESRgofL2Nvc21vcy5jcnlwdG8uc2VjcDI1NmsxLlB1YktleRIjCiECMaq0kJ1CELMUg1AB6M4LSw/Rrrl4Zc/sfYP88lme+JASRgofL2Nvc21vcy5jcnlwdG8uc2VjcDI1NmsxLlB1YktleRIjCiED55VgvJJMYyngMixfS/HN/qQfl2VCRQS22WusilN+qrkSRgofL2Nvc21vcy5jcnlwdG8uc2VjcDI1NmsxLlB1YktleRIjCiEDSGUxTo6hVge4e+3DAdulZPaT4lURA7g0rpA3E/3EtIoSDxINCgUIAxIBgBIECgIIfxgIEhMKDQoFdWp1bm8SBDYwMDAQgJBOGkIKQH925Ojq8EHHVMpJhVDbNnoUmoyvnJGt/0RC8nHF3KXkdVCC0Pcl6o3LQ/tCiEmHHJ8GF1jjMG6296FM8pGBEfw=",
                },
              ],
              total_count: "2",
            },
          };

          const wallets = response.result.txs.map((tx) => {
            const event = tx.tx_result.events.find((event) => {
              return event.type === "wasm-obisign";
            });
            if (!event) return null;
            const attributes = event.attributes.map((attribute) => {
              return {
                key: Buffer.from(attribute.key, "base64").toString("utf-8"),
                value: Buffer.from(attribute.value, "base64").toString("utf-8"),
              };
            });

            const contractAttribute = attributes.find((attribute) => {
              return attribute.key === "_contract_address";
            });

            if (!contractAttribute) return null;

            return {
              contract: contractAttribute.value,
              signers: attributes
                .filter((attribute) => {
                  return attribute.key === "signer";
                })
                .map((attribute) => {
                  return attribute.value;
                }),
            };
          });

          setWallets(
            wallets.filter((wallet) => {
              return wallet !== null;
            }) as Wallet[]
          );
        } catch (e) {
          console.log(e);
        }
      })();
    }, [address]);

    if (!wallets) return null;

    return (
      <SafeAreaView style={{ flex: 1 }}>
        <Background />
        <View
          style={{
            flex: 1,
            paddingHorizontal: 20,
            justifyContent: "space-between",
          }}
        >
          <View>
            <IconButton
              style={{
                marginTop: 20,
                marginLeft: -5,
                padding: 5,
                width: 25,
              }}
              onPress={() => {
                onCancel();
              }}
            >
              <FontAwesomeIcon
                icon={faChevronLeft}
                style={{ color: "#7B87A8" }}
              />
            </IconButton>
            <View style={{ justifyContent: "flex-end", marginTop: 43 }}>
              <View>
                <Text
                  style={{
                    color: "#F6F5FF",
                    fontSize: 24,
                    fontWeight: "600",
                    marginTop: 32,
                  }}
                >
                  <FormattedMessage
                    id="recover.choosewallet.title"
                    defaultMessage="Choose an existing wallet"
                  />
                </Text>
                <Text
                  style={{
                    color: "#999CB6",
                    fontSize: 14,
                    marginTop: 10,
                  }}
                >
                  <FormattedMessage
                    id="recover.choosewallet.subtext"
                    defaultMessage="We found the following Obi Wallets associated with your phone number and security answer. Select the one you want to recover."
                  />
                </Text>
              </View>
            </View>
            {wallets.map((wallet) => {
              const active = wallet === selectedWallet;

              return (
                <TouchableOpacity
                  key={wallet.contract}
                  style={{
                    height: 79,
                    width: "100%",
                    backgroundColor: "#111023",
                    marginBottom: 20,
                    flexDirection: "row",
                    borderRadius: 12,
                    paddingHorizontal: 10,
                  }}
                  onPress={() => {
                    setSelectedWallet((selectedWallet) => {
                      return selectedWallet === wallet ? null : wallet;
                    });
                  }}
                >
                  <View
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      paddingHorizontal: 10,
                    }}
                  >
                    <FontAwesomeIcon
                      icon={active ? faCircleCheck : faCircle}
                      style={{ color: "#7B87A8" }}
                    />
                  </View>
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      paddingHorizontal: 10,
                    }}
                  >
                    <Text
                      style={{
                        color: "#F6F5FF",
                        fontSize: 14,
                        fontWeight: "600",
                      }}
                    >
                      {Bech32Address.shortenAddress(wallet.contract, 20)}
                    </Text>
                  </View>
                  <IconButton
                    style={{
                      justifyContent: "center",
                      alignItems: "center",
                      paddingHorizontal: 10,
                    }}
                    onPress={() => {
                      Linking.openURL(
                        `https://www.mintscan.io/juno/wasm/contract/${wallet.contract}`
                      );
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faShare}
                      style={{ color: "#7B87A8" }}
                    />
                  </IconButton>
                </TouchableOpacity>
              );
            })}
          </View>
          <View>
            <VerifyAndProceedButton
              disabled={!selectedWallet}
              onPress={() => {
                onSelect(selectedWallet);
              }}
              style={{ marginBottom: 0 }}
            />
            <View style={{ alignItems: "center" }}>
              <TouchableOpacity
                onPress={() => {
                  onCancel();
                }}
                style={{ paddingVertical: 15, paddingHorizontal: 63 }}
              >
                <Text style={{ color: "#787B9C" }}>
                  <FormattedMessage
                    id="settings.multisig.modal.notnow"
                    defaultMessage="Not now"
                  />
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }
);

function getUrl(address: string) {
  const url = new URL("http://n-fsn-6.zyons.com:33093/tx_search");
  url.searchParams.append("query", `"wasm-obisign.signer='${address}'"`);

  return url.href;
}

export interface Wallet {
  contract: string;
  signers: string[];
}
