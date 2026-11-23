import {
  eventBus,
} from "../core/eventBus";

eventBus.on(
  "review_created",
  (review) => {

    if (
      review.rating <= 2
    ) {

      console.log(
        "⚠ Low rating detected"
      );
    }

    if (
      review.rating >= 4
    ) {

      console.log(
        "🔥 Highly rated product"
      );
    }
  }
);