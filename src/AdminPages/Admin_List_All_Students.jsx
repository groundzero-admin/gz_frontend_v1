import React, { useState, useEffect } from "react"
import { useOutletContext, useNavigate } from "react-router-dom"
import { FaUserGraduate, FaPlus, FaUserCheck } from "react-icons/fa"
import { getAllStudentDetails } from "../api.js"

// ================================
// Student Row
// ================================
const StudentRow = ({ student, isDark, navigate }) => {
  const ONLINE_UNIT = 1500
  const OFFLINE_UNIT = 1500

  // API field names stay OLD
  const onlineCredit =
    typeof student?.credit?.online === "number"
      ? student.credit.online
      : null

  const offlineCredit =
    typeof student?.credit?.offline === "number"
      ? student.credit.offline
      : null

  const onlineClasses =
    onlineCredit !== null ? Math.floor(onlineCredit ) : null

  const offlineClasses =
    offlineCredit !== null ? Math.floor(offlineCredit ) : null

  return (
    <tr
      className="border-b transition duration-150"
      style={{
        borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
        backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
      }}
    >
      {/* Name */}
      <td className="p-4 flex items-center gap-4">
        <FaUserGraduate className="text-[var(--accent-purple)] flex-shrink-0" />
        <span className="font-semibold">{student.username}</span>
      </td>

      {/* Email */}
      <td
        className="p-4 text-sm"
        style={{
          color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`,
        }}
      >
        {student.email}
      </td>

      {/* Class */}
      <td className="p-4 font-medium text-[var(--accent-teal)]">
        {student.class || "-"}
      </td>

      {/* Student Number */}
      <td className="p-4 font-bold">{student.student_number}</td>

      {/* Remaining Credits (NEW LABELS ONLY) */}
      <td className="p-4">
       <div className="flex flex-row gap-2 text-xs font-semibold text-white">

          {onlineClasses !== null && (
            <span
              className="px-3 py-1 rounded-lg"
              style={{ backgroundColor: "var(--accent-teal)" }}
            >
              Online Batch Credit: {onlineClasses}
            </span>
          )}

          {offlineClasses !== null && (
            <span
              className="px-3 py-1 rounded-lg"
              style={{ backgroundColor: "var(--accent-purple)" }}
            >
              Offline Batch Credit: {offlineClasses}
            </span>
          )}
        </div>
      </td>

      {/* Action */}
      <td className="p-4">
        <button
          onClick={() =>
            navigate(`/admin/dashboard/student/${student._id}`)
          }
          className="px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all duration-300 hover:opacity-90"
          style={{
            background:
              "linear-gradient(90deg, var(--accent-teal), var(--accent-purple))",
          }}
        >
          View Profile
        </button>
      </td>
    </tr>
  )
}

// ================================
// Add Student Button (Updated)
// ================================
const AddStudentButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="px-6 py-3 rounded-xl font-bold text-sm text-white transition-all duration-300 flex items-center gap-2 hover:opacity-90"
    style={{
      background:
        "linear-gradient(90deg, var(--accent-teal), var(--accent-purple))",
    }}
  >
    <FaPlus />
    Invite Student
  </button>
)

// ================================
// Main Page
// ================================
const AdminStudentPage = () => {
  const { isDark } = useOutletContext()
  const [students, setStudents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true)
      const response = await getAllStudentDetails()

      if (response.success) {
        setStudents(response.data)
      } else {
        alert(response.message)
      }

      setIsLoading(false)
    }

    fetchStudents()
  }, [])

  const cardStyle = {
    backgroundColor: `var(${isDark ? "--card-dark" : "--bg-light"})`,
    borderColor: `var(${isDark ? "--border-dark" : "--border-light"})`,
    backdropFilter: "blur(10px)",
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Students</h1>
        
        {/* Pass the navigation handler here */}
        <AddStudentButton onClick={() => navigate("/admin/dashboard/invitation")} />
      </div>

      {isLoading ? (
        <p className="text-lg">Loading student data...</p>
      ) : students.length === 0 ? (
        <div
          className="p-8 rounded-2xl border text-center mt-8"
          style={cardStyle}
        >
          <FaUserCheck className="text-5xl mx-auto mb-6 text-[var(--accent-teal)]" />
          <h2 className="text-2xl font-bold mb-2">
            No Students Registered
          </h2>
          <p
            style={{
              color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`,
            }}
          >
            Use the "Invite Student" button to begin onboarding.
          </p>
        </div>
      ) : (
        <div
          className="rounded-2xl border overflow-x-auto shadow-xl"
          style={cardStyle}
        >
          <table className="w-full text-left border-collapse">
            <thead
              className="text-sm uppercase"
              style={{
                color: `var(${isDark ? "--text-dark-secondary" : "--text-light-secondary"})`,
              }}
            >
              <tr className="border-b">
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Class</th>
                <th className="p-4">Student No.</th>
                <th className="p-4">Remaining Credits</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {students.map((student) => (
                <StudentRow
                  key={student._id}
                  student={student}
                  isDark={isDark}
                  navigate={navigate}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminStudentPage