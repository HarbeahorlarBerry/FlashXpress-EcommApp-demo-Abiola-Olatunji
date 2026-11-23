class RecommendationAgent {

  getRecommendations(
    products,
    category
  ) {

    return products.filter(
      (
        product
      ) =>
        product.category ===
        category
    );
  }
}


export default new RecommendationAgent();