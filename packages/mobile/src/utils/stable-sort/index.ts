export function stableSort<Item>(
  arr: ReadonlyArray<Item>,
  compareFn: (a: Item, b: Item) => number
): Array<Item> {
  const itemsWithIndex = arr.map<{
    index: number;
    item: Item;
  }>((item, index) => {
    return {
      index,
      item,
    };
  });

  return itemsWithIndex
    .sort((a, b) => {
      const compared = compareFn(a.item, b.item);
      if (compared === 0) {
        return a.index < b.index ? -1 : 1;
      }
      return compared;
    })
    .map(({ item }) => item);
}
