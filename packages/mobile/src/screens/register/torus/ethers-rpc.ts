import "@ethersproject/shims";

import { Buffer } from "buffer";
import { ethers } from "ethers";
global.Buffer = global.Buffer || Buffer;

const providerUrl = "https://rpc-fetchhub.fetch-ai.com";

const getChainId = async () => {
  try {
    const ethersProvider = ethers.getDefaultProvider(providerUrl);
    return await ethersProvider.getNetwork();
  } catch (error) {
    return error;
  }
};

const getAccounts = (key: string) => {
  try {
    const wallet = new ethers.Wallet(key);
    return wallet.address;
  } catch (error) {
    return error;
  }
};

const getBalance = async (key: string) => {
  try {
    const ethersProvider = ethers.getDefaultProvider(providerUrl);
    const wallet = new ethers.Wallet(key, ethersProvider);
    return await wallet.getBalance();
  } catch (error) {
    return error;
  }
};

const sendTransaction = async (key: string) => {
  try {
    const ethersProvider = ethers.getDefaultProvider(providerUrl);
    const wallet = new ethers.Wallet(key, ethersProvider);

    const destination = "0x40e1c367Eca34250cAF1bc8330E9EddfD403fC56";

    // Convert 1 ether to wei
    const amount = ethers.utils.parseEther("0.001");

    // Submit transaction to the blockchain
    return await wallet.sendTransaction({
      to: destination,
      value: amount,
      maxPriorityFeePerGas: "5000000000", // Max priority fee per gas
      maxFeePerGas: "6000000000000", // Max fee per gas
    });
  } catch (error) {
    return error;
  }
};

const signMessage = async (key: string) => {
  try {
    const ethersProvider = ethers.getDefaultProvider(providerUrl);
    const wallet = new ethers.Wallet(key, ethersProvider);

    const originalMessage = "YOUR_MESSAGE";

    // Sign the message
    return await wallet.signMessage(originalMessage);
  } catch (error) {
    return error;
  }
};

// eslint-disable-next-line import/no-default-export
export default {
  getChainId,
  getAccounts,
  getBalance,
  sendTransaction,
  signMessage,
};
