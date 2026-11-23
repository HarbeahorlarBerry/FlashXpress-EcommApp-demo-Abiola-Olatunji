import {
  eventBus,
} from "../core/eventBus";

eventBus.on(
  "review_created",
  (review) => {

    const text =
      review.review.toLowerCase();

    // Negative sentiment

    if (
      text.includes("bad") ||
      text.includes("terrible") ||
      text.includes("fake")
    ) {

      console.log(
        "⚠ Negative review detected"
      );
    }

    // Positive sentiment

    if (
      text.includes("good") ||
      text.includes("excellent") ||
      text.includes("awesome")
    ) {

      console.log(
        "✅ Positive review detected"
      );
    }
  }
);