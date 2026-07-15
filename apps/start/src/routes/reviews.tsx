import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { fetchReviews } from "../data";

export const reviewsQuery = queryOptions({ queryKey: ["reviews"], queryFn: fetchReviews });

export const Route = createFileRoute("/reviews")({
  loader: ({ context }) => context.queryClient.ensureQueryData(reviewsQuery),
  component: Reviews,
});

function Reviews() {
  const { data } = useSuspenseQuery(reviewsQuery);
  return (
    <div className="panel">
      <h2>Reviews</h2>
      <section className="expected">
        <strong>Expected behavior</strong>
        <ul>
          <li>
            The loader fills the TanStack Query cache via{" "}
            <code>context.queryClient.ensureQueryData</code>; the component reads it with{" "}
            <code>useSuspenseQuery</code>.
          </li>
        </ul>
      </section>
      <ul>
        {data.map((review) => (
          <li key={review.id}>
            {review.author}: {review.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
