import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getTickets } from "../features/tickets/ticket.api";
import type { Ticket } from "../features/tickets/ticket.types";

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTickets = async () => {
      try {
        setIsLoading(true);
        setError("");

        const data = await getTickets();

        setTickets(data);
      } catch {
        setError("Failed to load tickets");
      } finally {
        setIsLoading(false);
      }
    };

    loadTickets();
  }, []);

  if (isLoading) {
    return <p>Loading tickets...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>Tickets</h1>

      {tickets.length === 0 ? (
        <p>No tickets found.</p>
      ) : (
        <div>
          {tickets.map((ticket) => (
            <div key={ticket.id}>
              <Link to={`/tickets/${ticket.id}`}>
                <h2>{ticket.title}</h2>
              </Link>

              <p>{ticket.description}</p>

              <p>
                Priority: {ticket.priority}
              </p>

              <p>
                Status: {ticket.status}
              </p>

              <p>
                Created:{" "}
                {new Date(
                  ticket.created_at,
                ).toLocaleString()}
              </p>

              <hr />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}