export const getFilteredAddressValues = (values: any[], searchTerm: string) => {
  const filteredValues = values.filter((value) =>
    value.name.toLowerCase().includes(searchTerm)
  );

  return filteredValues;
};

export const getFilteredChainValues = (values: any[], searchTerm: string) => {
  const filteredValues = values.filter((value) =>
    value._chainInfo.chainName.toLowerCase().includes(searchTerm)
  );

  return filteredValues;
};
