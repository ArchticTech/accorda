import { useState, useMemo, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { MoreVertical, Eye, FileText } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  approveRequest,
} from "../../lib/loans";
import { ToastContainer, toast, Bounce } from "react-toastify";
import { supabase } from "../../lib/supabase";

// Status chip component
const StatusChip = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "application":
      case "application":
        return { color: "bg-blue-100 text-blue-800", label: "Application" };
      case "document":
        return { color: "bg-green-100 text-green-800", label: "Document" };
      case "validation":
        return { color: "bg-purple-100 text-purple-800", label: "Validation" };
      case "evaluation":
        return { color: "bg-yellow-100 text-yellow-800", label: "Evaluation" };
      case "signature":
        return { color: "bg-blue-100 text-blue-800", label: "Signature" };
      case "deposit":
        return { color: "bg-teal-100 text-teal-800", label: "Deposit" };
      case "express_deposit":
      case "express deposit":
        return { color: "bg-violet-100 text-violet-800", label: "Express Deposit" };
      case "completed":
      case "complete":
        return { color: "bg-emerald-100 text-emerald-800", label: "Completed" };
      case "error":
        return { color: "bg-red-100 text-red-800", label: "Error" };
      // Keep your existing statuses for backward compatibility
      case "pending":
        return { color: "bg-yellow-100 text-yellow-800", label: "Pending" };
      case "reviewing documents":
        return { color: "bg-blue-100 text-blue-800", label: "Document" };
      case "accept":
      case "accepted":
        return { color: "bg-green-100 text-green-800", label: "Accepted" };
      case "rejected":
        return { color: "bg-red-100 text-red-800", label: "Rejected" };
      default:
        return { color: "bg-gray-100 text-gray-800", label: status };
    }
  };

  const { color, label } = getStatusColor(status);
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  );
};


const ActionsDropdown = ({ loanId, onRequestApproved, initialStatus }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(initialStatus);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleRequest = async (status: string) => {
    try {
      const approveRequestStatus = await approveRequest(loanId, status);
  
      if (approveRequestStatus?.success) {
        const requestStatus = approveRequestStatus?.data[0]?.admin_request_status;
        
        setCurrentStatus(requestStatus);
        toast.success("Status Updated Successfully");
        setIsOpen(false);
          onRequestApproved();
      } else {
        toast.error("Failed to approve request");
        setIsOpen(false);
      }
    } catch (error) {
      toast.error("An error occurred");
      setIsOpen(false);
    }
  };

  const handleClickOutside = () => {
    if (isOpen) setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        className="text-gray-500 hover:text-gray-700 focus:outline-none p-1 rounded-full hover:bg-gray-100"
        onClick={toggleDropdown}
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
          <div className="py-1">
            <Link
              to={`/admin/request-view/${loanId}`}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Request 
            </Link>

            {/* Always show both Accept and Reject buttons */}
            {currentStatus !== 'accept' && (
              <button
                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => handleRequest("accept")}
              >
                <FileText className="h-4 w-4 mr-2" />
                Accept Request
              </button>
            )}

            {currentStatus !== 'rejected' && (
              <button
                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => handleRequest("rejected")}
              >
                <FileText className="h-4 w-4 mr-2" />
                Reject Request
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


const AdminRequests = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("requestDate");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loanRequests, setLoanRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get the URL parameters
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const statusFilter = queryParams.get('status');

  const fetchLoanRequests = async (loader) => {
    try {
     if(loader) {
      setIsLoading(true);
     }

      // Get loan requests
      // const result = await getAllLoanRequests();
      // if (result.success) {
      //   setLoanRequests(result?.data);
      // } else {
      //   console.log(result);
      //   setError("`Failed to fetch loan requests`");
      // }
      const { data, error } = await supabase.functions.invoke('get-all-loan-requests', {
        body: JSON.stringify({}), // No admin_request_status passed
      });
      
      if (error) {
        console.error('Function error:', error);
        setError('`Failed to fetch loan requests`');
      } else {
        setLoanRequests(data.data);
      }

    } catch (err) {
      console.error("Error fetching loan requests:", err);
      setError("An unexpected error occurred");
    } finally {
      if(loader ){
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchLoanRequests(true);
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return amount.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    });
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  // Handle sort request
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Handle page change
  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle search change
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  // Get sorted and filtered data
  const sortedAndFilteredData = useMemo(() => {
    // First filter by status if statusFilter is provided
    let filteredData = [...loanRequests];
    
    if (statusFilter) {
      filteredData = filteredData.filter(item => 
        item?.loanDetails?.request_stage?.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    // Then filter by search term if provided
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filteredData = filteredData.filter(item => {
        return (
          item.id.toString().includes(lowerCaseSearchTerm) ||
          (item?.customerData?.first_name + ' ' + item?.customerData?.last_name).toLowerCase().includes(lowerCaseSearchTerm) ||
          item?.loanDetails?.admin_request_status?.toLowerCase().includes(lowerCaseSearchTerm) ||
          item?.loanDetails?.request_stage?.toLowerCase().includes(lowerCaseSearchTerm) ||
          item.payFrequency?.toLowerCase().includes(lowerCaseSearchTerm)
        );
      });
    }

    // Sort data
    return [...filteredData].sort((a, b) => {
      let aValue = a[orderBy];
      let bValue = b[orderBy];

      // Handle nested properties
      if (orderBy === "loanPackage") {
        aValue = a.loanPackage.amount;
        bValue = b.loanPackage.amount;
      }

      // Handle date comparison
      if (orderBy === "requestDate" || orderBy === "nextPayDate") {
        return order === "asc"
          ? new Date(aValue) - new Date(bValue)
          : new Date(bValue) - new Date(aValue);
      }

      // Handle string comparison
      if (typeof aValue === "string" && typeof bValue === "string") {
        return order === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // Handle number comparison
      return order === "asc" ? aValue - bValue : bValue - aValue;
    });
  }, [loanRequests, searchTerm, orderBy, order, statusFilter]);

  // Get current page data
  const currentPageData = sortedAndFilteredData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Calculate pagination
  const totalPages = Math.ceil(sortedAndFilteredData.length / rowsPerPage);
  const pageNumbers = [];
  for (let i = 0; i < totalPages; i++) {
    pageNumbers.push(i);
  }

  const getTableTitle = () => {
    if (statusFilter) {
      return `${statusFilter} Stage Requests`;
    }
    return "All Requests";
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">{getTableTitle()}</h2>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">{getTableTitle()}</h2>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">{getTableTitle()}</h2>

        <div className="flex flex-col sm:flex-row justify-between mb-4 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search loan requests..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleRequestSort("id")}
                >
                  <div className="flex items-center">
                    Request ID
                    {orderBy === "id" && (
                      <span className="ml-1">
                        {order === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleRequestSort("requestDate")}
                >
                  <div className="flex items-center">
                    Request Date
                    {orderBy === "requestDate" && (
                      <span className="ml-1">
                        {order === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleRequestSort("customerName")}
                >
                  <div className="flex items-center">
                    Customer Name
                    {orderBy === "customerName" && (
                      <span className="ml-1">
                        {order === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleRequestSort("loanPackage")}
                >
                  <div className="flex items-center">
                    Loan Package
                    {orderBy === "loanPackage" && (
                      <span className="ml-1">
                        {order === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleRequestSort("payFrequency")}
                >
                  <div className="flex items-center">
                    Pay Frequency
                    {orderBy === "payFrequency" && (
                      <span className="ml-1">
                        {order === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>

                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleRequestSort("nextPayDate")}
                >
                  <div className="flex items-center">
                    Next Pay Date
                    {orderBy === "nextPayDate" && (
                      <span className="ml-1">
                        {order === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                
                {/* Hide Request Status column when statusFilter is present */}
                {!statusFilter && (
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleRequestSort("status")}
                  >
                    <div className="flex items-center">
                      Request Status
                      {orderBy === "status" && (
                        <span className="ml-1">
                          {order === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                )}
                
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleRequestSort("status")}
                  >
                    <div className="flex items-center">
                      Request Stage
                      {orderBy === "status" && (
                        <span className="ml-1">
                          {order === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentPageData.length > 0 ? (
                currentPageData.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {row.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(row?.loanDetails?.request_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {`${row?.customerData?.first_name} ${row?.customerData?.last_name}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {`${formatCurrency(row.loanPackage.amount)} - ${
                        row.loanPackage.duration
                      }`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {row.payFrequency}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(row?.loanDetails?.next_pay_date)}
                    </td>
                    
                    {/* Hide Request Status cell when statusFilter is present */}
                    {!statusFilter && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusChip
                          status={row?.loanDetails?.admin_request_status}
                        />
                      </td>
                    )}
                    
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusChip
                          status={row?.loanDetails?.request_stage}
                        />
                      </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <ActionsDropdown
                        loanId={row.id}
                        onRequestApproved={()=>fetchLoanRequests(false)}
                        initialStatus={row?.loanDetails?.admin_request_status}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={statusFilter ? 6 : 8}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No loan requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handleChangePage(page - 1)}
              disabled={page === 0}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                page === 0
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => handleChangePage(page + 1)}
              disabled={page >= totalPages - 1}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                page >= totalPages - 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{" "}
                <span className="font-medium">
                  {sortedAndFilteredData.length > 0 ? page * rowsPerPage + 1 : 0}
                </span> to{" "}
                <span className="font-medium">
                  {Math.min(
                    (page + 1) * rowsPerPage,
                    sortedAndFilteredData.length
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium">
                  {sortedAndFilteredData.length}
                </span>{" "}
                results
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() => handleChangePage(page - 1)}
                  disabled={page === 0}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    page === 0
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {pageNumbers.map((number) => (
                  <button
                    key={number}
                    onClick={() => handleChangePage(number)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === number
                        ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {number + 1}
                  </button>
                ))}
                <button
                  onClick={() => handleChangePage(page + 1)}
                  disabled={page >= totalPages - 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    page >= totalPages - 1
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-500">
            <strong>Note:</strong> You can view the details of each loan request
            by clicking on the action menu.
          </p>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />
    </>
  );
};

export default AdminRequests;