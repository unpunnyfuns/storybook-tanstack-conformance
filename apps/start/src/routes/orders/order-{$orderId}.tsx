import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/orders/order-{$orderId}")({
  component: Order,
});

function Order() {
  const { orderId } = Route.useParams();
  return (
    <div className="panel">
      <h2>Order {orderId}</h2>
      <section className="expected">
        <strong>Expected behavior</strong>
        <ul>
          <li>
            The param has a static prefix: <code>/orders/order-42</code> yields{" "}
            <code>orderId = 42</code>.
          </li>
        </ul>
      </section>
    </div>
  );
}
