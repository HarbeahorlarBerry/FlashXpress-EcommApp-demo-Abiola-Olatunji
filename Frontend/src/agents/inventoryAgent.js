class InventoryAgent {

  analyze(
    product
  ) {

    if (
      product.stock <
      5
    ) {

      return {
        low: true,
        message:
          "Restock needed",
      };
    }


    return {
      low: false,
    };
  }
}


export default new InventoryAgent();