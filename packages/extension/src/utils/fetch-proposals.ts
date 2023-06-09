import axios from "axios";
export const fetchProposals = async (chainId: string) => {
  if (chainId === "fetchhub-4")
    return await axios
      .get("https://rest-fetchhub.fetch.ai/cosmos/gov/v1beta1/proposals")
      .then((response) => response.data)
      .catch((e) => console.log(e));

  return await axios
    .get("https://rest-dorado.fetch.ai/cosmos/gov/v1beta1/proposals")
    .then((response) => response.data)
    .catch((e) => console.log(e));
};

export const fetchVote = async (
  proposalId: string,
  address: string,
  url: string
) => {
  const response = await axios.get(
    `${url}/cosmos/gov/v1beta1/proposals/${proposalId}/votes/${address}`
  );
  return response.data;
};
