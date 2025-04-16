import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {MoreVertical, Eye } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  getLoanIds,
  addPerception ,
  getPerceptionDetails 
} from "../../lib/loans";
import { ToastContainer, toast, Bounce } from "react-toastify";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

// Status chip component
const StatusChip = ({ status }) => {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "new":
        return { color: "bg-green-50 border-green-500 text-green-700" };
      case "negotiation":
        return { color: "bg-blue-50 border-blue-500 text-blue-700" };
      case "notice 7 days":
        return { color: "bg-yellow-50 border-yellow-500 text-yellow-700" };
      case "notice 72h":
        return { color: "bg-orange-50 border-orange-500 text-orange-700" };
      case "pre collection":
        return { color: "bg-indigo-50 border-indigo-500 text-indigo-700" };
      case "collection":
        return { color: "bg-purple-50 border-purple-500 text-purple-700" };
      case "loss":
        return { color: "bg-red-50 border-red-500 text-red-700" };
      case "resolved":
        return { color: "bg-gray-50 border-gray-500 text-gray-700" };
      default:
        return { color: "bg-gray-50 border-gray-500 text-gray-700" };
    }
  };

  const { color } = getStatusColor(status);
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${color}`}>
      {status}
    </span>
  );
};


const ActionsDropdown = ({ perceptionId, onPerceptionDeletex, initialStatus }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(initialStatus);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
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
              to={`/admin/perception-view/${perceptionId}`}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Perception
            </Link>
{/* 
            <button
                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete Perception
              </button> */}
          
          </div>
        </div>
      )}
    </div>
  );
};

const AdminPerceptions = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("requestDate");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loanRequests, setLoanRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [loanList , setLoanList] = useState([])

  const [open, setOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [selectedStage, setSelectedStage] = useState("");
  const [perceptionLoading , setPerceptionLoading] = useState(false)

  const loanOptions = ["Home Loan", "Car Loan", "Personal Loan"];
  const stageOptions = [

    "New",
     "Negotiation",
      "Notice 7 Days",
       "Notice 72h", 
       "Pre Collection", 
       "Collection", 
       "Loss", 
       "Resolved"
  ];

  


  async function getLoanList(){
    const getIds = await getLoanIds()
      setLoanList(getIds?.data)
  } 

  useEffect(() => {
      getLoanList()
  }, []);

  const fetchLoanRequests = async (loader) => {
    // if (!user) return;

    try {
      if (loader) {
        setIsLoading(true);
      }

      // Get customer ID from auth ID
      // const customerIdResult = await getCustomerIdFromAuthId(user.id);

      // if (!customerIdResult.success) {
      //   setError('Failed to fetch customer information');
      //   setIsLoading(false);
      //   return;
      // }

      // Get loan requests
      const result = await getPerceptionDetails();
      if (result.success) {
        console.log(result)
        setLoanRequests(result?.data);
        console.log(result?.data)
      } else {
        console.log(result);
        setError("`Failed to fetch loan requests`");
      }
    } catch (err) {
      console.error("Error fetching loan requests:", err);
      setError("An unexpected error occurred");
    } finally {
      if (loader) {
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
    // setPage(0);
  };

  // Get sorted and filtered data
  const sortedAndFilteredData = useMemo(() => {
    // Filter data based on search term
    let filteredData = [...loanRequests];
    // if (searchTerm) {
    //   const lowerCaseSearchTerm = searchTerm.toLowerCase();
    //   // filteredData = filteredData.filter(item =>

    //   // );
    //   filteredData = filteredData.filter((item) => {
    //     item.reference.toLowerCase().includes(lowerCaseSearchTerm) ||
    //       item.status.toLowerCase().includes(lowerCaseSearchTerm) ||
    //       item.payFrequency.toLowerCase().includes(lowerCaseSearchTerm);
    //   });
    // }

    // Sort data
    return [...filteredData].sort((a, b) => {
      let aValue = a[orderBy];
      let bValue = b[orderBy];

      // Handle nested properties
      if (orderBy === "loanPackage") {
        aValue = a.loanPackage.data.amount;
        bValue = b.loanPackage.data.amount;
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
  }, [loanRequests, searchTerm, orderBy, order]);

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

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Perceptions</h2>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">All Perceptions</h2>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          <p>{error}</p>
        </div>
        {/* <div className="mt-4">
          <Link 
            to="/customer/new-loan"
            className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            New Loan Request
          </Link>
        </div> */}
      </div>
    );
  }


  


  
  const getPayFrequencyText = (code) => {
    const frequencies = {
      "1month": "Once a month",
      "2weeks": "Every 2 weeks",
      bimonthly: "Twice a month",
      "1week": "Every week",
    };
    return frequencies[code] || code;
  };



  

  async function createPerception() {
    if (!selectedLoan || !selectedStage) {
      toast.error('Select Loan and Perception Stage');
      return;
    }
  
    try {
      setPerceptionLoading(true);
  
      const result = await addPerception(selectedLoan, selectedStage);
  
      if (!result?.success) {
        toast.error(result?.message || 'Failed to add perception');
        return;
      }
  
      await fetchLoanRequests(false);
      toast.success('Perception added successfully');
      
      setSelectedLoan(null);
      setSelectedStage('');
  
      setTimeout(() => {
        setOpen(!open);
      }, 1500);
    } catch (error) {
      console.log(error);
      toast.error('An error occurred');
    } finally {
      setPerceptionLoading(false);
    }
  }
  
  return (
    <>
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Perceptions</h2>

        <div className="flex flex-col sm:flex-row justify-between mb-4 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search perceptions..."
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
          <button
            // to="/customer/new-loan"
            onClick={() => setOpen(true)}
            className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create Perception
          </button>
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
                    Perception ID
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
                  onClick={() => handleRequestSort("id")}
                >
                  <div className="flex items-center">
                    Loan ID
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
                    Perception Created
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
                  onClick={() => handleRequestSort("status")}
                >
                  <div className="flex items-center">
                    Perception Status
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
                  <tr key={row.perceptionData.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {row.perceptionData.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {row.loanData[0].id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(row?.perceptionData?.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {`${row?.customerData?.data?.first_name} ${row?.customerData?.data?.last_name}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {`${formatCurrency(row.loanPackage.data.amount)} - ${
                        row.loanPackage.data.duration
                      }`}
                    </td>
                    


                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.loanData[0]?.pay_frequency
                  ? getPayFrequencyText(row.loanData[0].pay_frequency)
                  : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusChip
                        status={row?.perceptionData?.stage}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <ActionsDropdown
                        perceptionId={row.perceptionData.id}
                        onPerceptionDeletex={() => fetchLoanRequests(false)}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
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
                <span className="font-medium">{page * rowsPerPage + 1}</span> to{" "}
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

<Transition show={open} as={Fragment}>
        <Dialog as="div" className="fixed inset-0 flex items-center justify-center z-50" onClose={() => setOpen(false)}>
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
          
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="relative bg-white p-6 w-[400px] rounded-lg shadow-xl">
              <Dialog.Title className="text-xl font-bold mb-4">Create Perception</Dialog.Title>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Select Loan</label>
                <select 
                className="w-full mt-1 p-2 border rounded-md" 
                value={selectedLoan} 
                onChange={(e) => setSelectedLoan(e.target.value)}
              >
                <option value="">Select Loan ID</option>
                {loanList.map((loan, index) => (
                  <option key={index} value={loan.id}>{loan.id}</option>
                ))}
                
              </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Select Stage</label>
                <select 
                className="w-full mt-1 p-2 border rounded-md" 
                value={selectedStage} 
                onChange={(e) => setSelectedStage(e.target.value)}
              >
                <option value="">Select Stage</option>
                {stageOptions.map((stage, index) => (
                  <option key={index} value={stage}>{stage}</option>
                ))}
              </select>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button 
                  className="px-4 py-2 border rounded-md" 
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>
                <button 
                disabled={perceptionLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                  onClick={() => createPerception()}
                >
                  {
                    perceptionLoading ? 'Creating ..... ' : 'Create'
                  }
                </button>
              </div>
            </div>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  );
};

export default AdminPerceptions;
