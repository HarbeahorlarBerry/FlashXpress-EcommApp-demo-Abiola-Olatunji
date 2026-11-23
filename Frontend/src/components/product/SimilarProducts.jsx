import {
  useEffect,
  useState,
} from "react";

import {
  getProducts,
} from "../../api/productApi";

import ProductCard from "./ProductCard";

function SimilarProducts({
  currentProduct,
}) {

  const [products, setProducts] =
    useState([]);

  useEffect(() => {

    if (!currentProduct) {
      return;
    }

    const fetchProducts =
      async () => {

        try {

          const response =
            await getProducts();

          const filtered =
            response.data.products.filter(
              (item) =>
                item._id !==
                  currentProduct._id &&
                (
                  item.category ===
                    currentProduct.category ||
                  item.color ===
                    currentProduct.color ||
                  item.size ===
                    currentProduct.size
                )
            );

          setProducts(
            filtered.slice(0, 4)
          );

        } catch (error) {

          console.log(
            "SIMILAR PRODUCTS ERROR:",
            error
          );
        }
      };

    fetchProducts();

  }, [currentProduct]);

  if (
    products.length === 0
  ) {
    return null;
  }

  return (

    <div className="mt-16">

      <h2 className="text-3xl font-bold mb-8">
        Similar Products
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        {products.map(
          (product) => (

            <ProductCard
              key={product._id}
              product={product}
            />
          )
        )}

      </div>

    </div>
  );
}

export default SimilarProducts;