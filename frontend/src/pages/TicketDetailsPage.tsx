import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  assignTicket,
  createTicketComment,
  getTicket,
  getTicketComments,
} from "../features/tickets/ticket.api";

import {
  getTechnicians,
  type Technician,
} from "../features/users/user.api";

import { useAuth } from "../features/auth/AuthContext";

import type {
  Ticket,
  TicketComment,
} from "../features/tickets/ticket.types";

export default function TicketDetailsPage() {
  const { id } = useParams();

  const { user } = useAuth();

  const [ticket, setTicket] =
    useState<Ticket | null>(null);

  const [comments, setComments] =
    useState<TicketComment[]>([]);

  const [technicians, setTechnicians] =
    useState<Technician[]>([]);

  const [selectedTechnician, setSelectedTechnician] =
    useState("");

  const [comment, setComment] = useState("");

  const [isLoading, setIsLoading] =
    useState(true);

  const [isCommentLoading, setIsCommentLoading] =
    useState(false);

  const [isAssigning, setIsAssigning] =
    useState(false);

  const [error, setError] = useState("");

  const [commentError, setCommentError] =
    useState("");

  const [assignError, setAssignError] =
    useState("");

  const isAdmin = user?.role === "ADMIN";

  const ticketId = Number(id);

  const loadTicketDetails = async () => {
    if (
      !Number.isInteger(ticketId) ||
      ticketId <= 0
    ) {
      setError("Invalid ticket ID");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const ticketData =
        await getTicket(ticketId);

      const commentsData =
        await getTicketComments(ticketId);

      setTicket(ticketData);
      setComments(commentsData);

      if (ticketData.technician_id) {
        setSelectedTechnician(
          String(ticketData.technician_id),
        );
      } else {
        setSelectedTechnician("");
      }
    } catch {
      setError(
        "Failed to load ticket details",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTicketDetails();
  }, [id]);

  // Load technicians for ADMIN
  useEffect(() => {
    const loadTechnicians = async () => {
      if (!isAdmin) {
        return;
      }

      try {
        const data = await getTechnicians();

        setTechnicians(data);
      } catch {
        setAssignError(
          "Failed to load technicians",
        );
      }
    };

    loadTechnicians();
  }, [isAdmin]);

  // Assign technician
  const handleAssignTechnician = async () => {
    if (!selectedTechnician) {
      setAssignError(
        "Please select a technician",
      );
      return;
    }

    try {
      setIsAssigning(true);
      setAssignError("");

      await assignTicket(
        ticketId,
        Number(selectedTechnician),
      );

      await loadTicketDetails();
    } catch {
      setAssignError(
        "Failed to assign technician",
      );
    } finally {
      setIsAssigning(false);
    }
  };

  // Add comment
  const handleCommentSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!comment.trim()) {
      return;
    }

    try {
      setIsCommentLoading(true);
      setCommentError("");

      await createTicketComment(
        ticketId,
        comment.trim(),
      );

      const updatedComments =
        await getTicketComments(ticketId);

      setComments(updatedComments);
      setComment("");
    } catch {
      setCommentError(
        "Failed to add comment",
      );
    } finally {
      setIsCommentLoading(false);
    }
  };

  if (isLoading) {
    return <p>Loading ticket...</p>;
  }

  if (error) {
    return (
      <div>
        <p>{error}</p>

        <Link to="/tickets">
          Back to Tickets
        </Link>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div>
        <p>Ticket not found.</p>

        <Link to="/tickets">
          Back to Tickets
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}

      <div>
        <Link to="/tickets">
          ← Back to Tickets
        </Link>

        <h1>
          Ticket #{ticket.id}
        </h1>
      </div>

      {/* Ticket Details */}

      <section>
        <h2>{ticket.title}</h2>

        <p>{ticket.description}</p>

        <p>
          <strong>Priority:</strong>{" "}
          {ticket.priority}
        </p>

        <p>
          <strong>Status:</strong>{" "}
          {ticket.status}
        </p>

        <p>
          <strong>Created:</strong>{" "}
          {new Date(
            ticket.created_at,
          ).toLocaleString()}
        </p>

        <p>
          <strong>Last Updated:</strong>{" "}
          {new Date(
            ticket.updated_at,
          ).toLocaleString()}
        </p>
      </section>

      {/* Creator */}

      <section>
        <h3>Created By</h3>

        <p>
          <strong>Name:</strong>{" "}
          {ticket.creator_name}
        </p>

        <p>
          <strong>Email:</strong>{" "}
          {ticket.creator_email}
        </p>
      </section>

      {/* Assigned Technician */}

      <section>
        <h3>Assigned Technician</h3>

        {ticket.technician_id ? (
          <>
            <p>
              <strong>Name:</strong>{" "}
              {ticket.technician_name}
            </p>

            <p>
              <strong>Email:</strong>{" "}
              {ticket.technician_email}
            </p>
          </>
        ) : (
          <p>Not assigned</p>
        )}
      </section>

      {/* ADMIN Assignment */}

      {isAdmin && (
        <section>
          <h3>Assign Technician</h3>

          <select
            value={selectedTechnician}
            onChange={(event) =>
              setSelectedTechnician(
                event.target.value,
              )
            }
          >
            <option value="">
              Select technician
            </option>

            {technicians.map(
              (technician) => (
                <option
                  key={technician.id}
                  value={technician.id}
                >
                  {technician.name} (
                  {technician.email})
                </option>
              ),
            )}
          </select>

          <button
            type="button"
            onClick={
              handleAssignTechnician
            }
            disabled={
              isAssigning ||
              !selectedTechnician
            }
          >
            {isAssigning
              ? "Assigning..."
              : "Assign Technician"}
          </button>

          {assignError && (
            <p>{assignError}</p>
          )}
        </section>
      )}

      {/* Activity */}

      <section>
        <h3>Activity</h3>

        <p>
          <strong>Comments:</strong>{" "}
          {ticket.comment_count}
        </p>

        <p>
          <strong>Status Changes:</strong>{" "}
          {ticket.history_count}
        </p>
      </section>

      {/* Comments */}

      <section>
        <h3>Comments</h3>

        {comments.length === 0 ? (
          <p>No comments yet.</p>
        ) : (
          <div>
            {comments.map((item) => (
              <div key={item.id}>
                <strong>
                  {item.user_name}
                </strong>

                <span>
                  {" "}
                  ({item.user_role})
                </span>

                <p>{item.comment}</p>

                <small>
                  {new Date(
                    item.created_at,
                  ).toLocaleString()}
                </small>

                <hr />
              </div>
            ))}
          </div>
        )}

        {/* Add Comment */}

        <form
          onSubmit={handleCommentSubmit}
        >
          <div>
            <label htmlFor="comment">
              Add Comment
            </label>

            <br />

            <textarea
              id="comment"
              value={comment}
              onChange={(event) =>
                setComment(event.target.value)
              }
              placeholder="Write a comment..."
              rows={4}
              required
            />
          </div>

          {commentError && (
            <p>{commentError}</p>
          )}

          <button
            type="submit"
            disabled={
              isCommentLoading ||
              !comment.trim()
            }
          >
            {isCommentLoading
              ? "Adding..."
              : "Add Comment"}
          </button>
        </form>
      </section>
    </div>
  );
}