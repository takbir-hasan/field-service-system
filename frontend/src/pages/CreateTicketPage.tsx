import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createTicket } from "../features/tickets/ticket.api";
import type { TicketPriority } from "../features/tickets/ticket.types";

export default function CreateTicketPage() {

  
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");
  const [priority, setPriority] =
    useState<TicketPriority>("MEDIUM");

  const [isLoading, setIsLoading] =
    useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      await createTicket({
        title,
        description,
        priority,
      });

      navigate("/tickets");
    } catch {
      setError("Failed to create ticket");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>Create Ticket</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">
            Title
          </label>

          <input
            id="title"
            type="text"
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            required
            maxLength={200}
          />
        </div>

        <div>
          <label htmlFor="description">
            Description
          </label>

          <textarea
            id="description"
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            required
          />
        </div>

        <div>
          <label htmlFor="priority">
            Priority
          </label>

          <select
            id="priority"
            value={priority}
            onChange={(event) =>
              setPriority(
                event.target
                  .value as TicketPriority,
              )
            }
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">
              Medium
            </option>
            <option value="HIGH">High</option>
            <option value="URGENT">
              Urgent
            </option>
          </select>
        </div>

        {error && <p>{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
        >
          {isLoading
            ? "Creating..."
            : "Create Ticket"}
        </button>
      </form>
    </div>
  );
}