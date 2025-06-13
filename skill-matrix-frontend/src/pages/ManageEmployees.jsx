import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../api";
import "../styles/ManageEmployees.css";
import CreateEmployeeForm from "./CreateEmployeeForm.jsx"; // Ensure .jsx extension if used

const ManageEmployees = () => {
  const { user } = useSelector((state) => state.auth);
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!user || !["HR", "Lead"].includes(user?.role?.role_name)) {
      setError("Unauthorized. Only HR and Leads can view this.");
      return;
    }

    const fetchEmployees = async () => {
      try {
        const res = await api.get("/employees");
        setEmployees(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load employees.");
      }
    };

    fetchEmployees();
  }, [user]);

  if (error) return <div className="employee-error">{error}</div>;

  return (
    <div className="employee-card-container">
      {/* New div for the main heading bar */}
      <div className="main-heading-bar">
        {!showForm && (
          <h2>
            {user.role.role_name === "HR" ? "All Employees" : "My Team Members"}
          </h2>
        )}
      </div>

      {user.role.role_name === "HR" && (
        // Button is now in its own actions-bar for right-alignment
        <div className="actions-bar">
          <button className="create-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Back to Employee List" : "Create New Employee"}
          </button>
        </div>
      )}

      {showForm ? (
        <CreateEmployeeForm onSuccess={() => setShowForm(false)} />
      ) : (
        <div className="employee-grid">
          {employees.map((emp) => (
            <div className="employee-card" key={emp.employee_id}>
              <div className="employee-initial">
                {emp.employee_name.charAt(0).toUpperCase()}
              </div>
              <div className="employee-details">
                <h3 className="employee-name">{emp.employee_name}</h3>
                <div className="employee-meta">
                  <span className="meta-title">Role:</span>{" "}
                  {emp.role?.role_name}
                </div>
                <div className="employee-meta">
                  <span className="meta-title">Email:</span> {emp.email}
                </div>
                <div className="employee-meta">
                  <span className="meta-title">Designation:</span>{" "}
                  {emp.designation?.designation_name}{" "}
                  {emp.categories?.length > 0 && (
                    <span className="primary-category-title">
                      {
                        emp.categories.find((cat) => cat.is_primary)
                          ?.category_name
                      }{" "}
                      Developer
                    </span>
                  )}
                </div>

                <div className="employee-meta">
                  <span className="meta-title">Team:</span>{" "}
                  {emp.team?.team_name}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageEmployees;
