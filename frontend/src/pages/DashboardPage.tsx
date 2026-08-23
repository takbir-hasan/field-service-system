import { useAuth } from "../features/auth/AuthContext";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div>
      <header>
        <div>
          <h1>Field Service Management</h1>

          <p>
            Welcome, {user?.name}
          </p>
        </div>

        <div>
          <span>{user?.role}</span>

          <button onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main>
        <h2>Dashboard</h2>

        <div>
          <p>Total Tickets</p>
          <strong>0</strong>
        </div>

        <div>
          <p>Open Tickets</p>
          <strong>0</strong>
        </div>

        <div>
          <p>In Progress</p>
          <strong>0</strong>
        </div>

        <div>
          <p>Completed</p>
          <strong>0</strong>
        </div>
      </main>
    </div>
  );
}