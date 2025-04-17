import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { LoanDetailsFromId, updateRequestStage } from "../../lib/loans";
import {
  Check,
  X,
  Clock,
  AlertCircle,
  Info,
  User,
  MapPin,
  Banknote,
  Calendar,
  FileText,
  Shield,
  Mail,
  Phone,
  CreditCard,
} from "lucide-react";
import { ToastContainer, toast, Bounce } from "react-toastify";
import { supabase } from "/src/lib/supabase";

const ActionButtons = ({ loanId, onRequestApproved, initialStatus }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(initialStatus);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleRequest = async (status: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('approve-loan-request', {
        body: {
          loanId: loanId,
          status: status,
        },
      });
      
      if (error) {
        console.error('Failed to approve request:', error);
        toast.error("Failed to approve request");
        setIsOpen(false);
        return;
      }
      
      const approveRequestStatus = data; // your function should return { success: true/false, data: [...] }
      
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
    <div
      className="relative flex items-center gap-2"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Always show both Accept and Reject buttons */}
      {currentStatus !== "accept" && (
        <button
          onClick={() => handleRequest("accept")}
          className="bg-green-500 flex items-center gap-2 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out"
        >
          <Check size={20} /> <span>Accept Request</span>
        </button>
      )}

      {currentStatus !== "rejected" && (
        <button
          onClick={() => handleRequest("rejected")}
          className="bg-red-500 flex items-center gap-2 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 ease-in-out"
        >
          <X size={20} /> <span>Reject Request</span>
        </button>
      )}
    </div>
  );
};

const AdminRequestView = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getLoanRequest = async (loader) => {
    try {
      if (loader) {
        setIsLoading(true);
      }
      const data = await LoanDetailsFromId(id);
      setFormData(data?.data[0]);
      console.log(data);
    } catch (error) {
      console.log(error);
    } finally {
      if (loader) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    getLoanRequest(true);
  }, [id]);

  const STEPS = [
    { id: "Application", label: "Application" },
    { id: "Document", label: "Document" },
    { id: "Validation", label: "Validation" },
    { id: "Evaluation", label: "Evaluation" },
    { id: "Signature", label: "Signature" },
    { id: "Deposit", label: "Deposit" },
    { id: "Express Deposit", label: "Express Deposit" },
    { id: "Completed", label: "Completed" },
    { id: "Error", label: "Error" },
  ];

  const handleStepClick = async (stepId) => {
    if (!formData) return;

    try {
      await updateRequestStage(id, stepId); // Supabase update call
      const updatedData = await LoanDetailsFromId(id); // Re-fetch updated data
      setFormData(updatedData?.data[0]);
      toast.success("Stage Updated Succesfully");
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update status");
    }
  };

  // Stepper UI rendering logic
  const renderStepper = () => {
    const currentStage = formData?.loanDetails?.request_stage || "Application";
    const currentIndex = STEPS.findIndex((step) => step.id === currentStage);

    return (
      <div className="flex gap-2 my-6">
        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          // const isActive = index === currentIndex && step.label === 'Document'; // to add colors

          return (
            <button
              key={step.id}
              onClick={() => handleStepClick(step.id)}
              className={`flex-1 p-3 text-center rounded-lg border transition-colors ${
                isActive
                  ? "bg-blue-500 text-white border-blue-600"
                  : isCompleted
                  ? "bg-gray-200 text-gray-600 border-gray-300"
                  : "bg-white text-gray-400 border-gray-200"
              }`}
              disabled={isLoading}
            >
              {step.label}
            </button>
          );
        })}
      </div>
    );
  };

  const formatCurrency = (amount) => {
    if (!amount) return "-";
    return `$${parseFloat(amount.toString()).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getProvinceName = (code) => {
    const provinces = {
      AB: "Alberta",
      BC: "British Columbia",
      MB: "Manitoba",
      NB: "New Brunswick",
      NL: "Newfoundland and Labrador",
      NS: "Nova Scotia",
      NT: "Northwest Territories",
      NU: "Nunavut",
      ON: "Ontario",
      PE: "Prince Edward Island",
      QC: "Quebec",
      SK: "Saskatchewan",
      YT: "Yukon",
    };
    return provinces[code] || code;
  };

  const getBankName = (code) => {
    const banks = {
      "001": "Bank of Montreal",
      "002": "Scotiabank",
      "003": "RBC Royal Bank",
      "004": "Toronto-Dominion Bank",
      "006": "National Bank",
      "010": "CIBC Bank",
      "016": "HSBC Bank",
      "030": "Canadian Western Bank",
      "039": "Laurentian Bank of Canada",
      "219": "Alberta Treasury Branch",
      "310": "First National Bank",
      "320": "PC Financial",
      "540": "Manulife Bank",
      "568": "Peace Hills Trust",
      "614": "Tangerine Bank",
      "621": "KOHO Bank",
      "809": "Credit Union British Columbia",
      "815": "Desjardins Quebec",
      "828": "Credit Union Ontario",
      "829": "Desjardins Ontario",
      "837": "Credit Union Meridian",
      "839": "Credit Union Heritage Brunswick",
      "849": "Brunswick Credit Union",
      "879": "Credit Union Manitoba",
      "899": "Credit Union Alberta",
      "000": "Other",
    };
    return banks[code] || code;
  };

  const getIncomeSourceName = (code) => {
    const sources = {
      employed: "Employed",
      saaq: "SAAQ",
      CSST: "CSST",
      pension: "Pension",
      invalidity: "Invalidity",
      insurance: "Employment Insurance",
      rqap: "RQAP",
    };
    return sources[code] || code;
  };

  const getPayFrequencyText = (code) => {
    const frequencies = {
      "1month": "Once a month",
      "2weeks": "Every 2 weeks",
      bimonthly: "Twice a month",
      "1week": "Every week",
    };
    return frequencies[code] || code;
  };

  const getFileTreatmentText = (method) => {
    return method === "priority"
      ? "Priority Treatment (4 hours)"
      : "Normal Treatment (24 hours)";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    } catch (error) {
      return dateString;
    }
  };

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case "application":
        return (
          <span className="inline-flex items-center px-3 py-2 rounded-full bg-gray-100 text-gray-800 text-sm">
            <Check className="w-4 h-4 mr-1" /> Application
          </span>
        );
      case "document":
        return (
          <span className="inline-flex items-center px-3 py-2 rounded-full bg-gray-100 text-gray-800 text-sm">
            <Check className="w-4 h-4 mr-1" /> Document
          </span>
        );
      case "reviewing documents":
        return (
          <span className="inline-flex items-center px-3 py-2 rounded-full bg-green-100 text-green-800 text-sm">
            <Check className="w-4 h-4 mr-1" /> Reviewing Documents
          </span>
        );
      case "validation":
        return (
          <span className="inline-flex items-center px-3 py-2 rounded-full bg-blue-100 text-blue-800 text-sm">
            <Check className="w-4 h-4 mr-1" /> Validation
          </span>
        );
      case "evaluation":
        return (
          <span className="inline-flex items-center px-3 py-2 rounded-full bg-purple-100 text-purple-800 text-sm">
            <Check className="w-4 h-4 mr-1" /> Evaluation
          </span>
        );
      case "signature":
        return (
          <span className="inline-flex items-center px-3 py-2 rounded-full bg-indigo-100 text-indigo-800 text-sm">
            <Check className="w-4 h-4 mr-1" /> Signature
          </span>
        );
      case "deposit":
        return (
          <span className="inline-flex items-center px-3 py-2 rounded-full bg-teal-100 text-teal-800 text-sm">
            <Check className="w-4 h-4 mr-1" /> Deposit
          </span>
        );
      case "express deposit":
        return (
          <span className="inline-flex items-center px-3 py-2 rounded-full bg-teal-200 text-teal-900 text-sm">
            <Check className="w-4 h-4 mr-1" /> Express Deposit
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center px-3 py-2 rounded-full bg-green-100 text-green-800 text-sm">
            <Check className="w-4 h-4 mr-1" /> Completed
          </span>
        );
      case "error":
        return (
          <span className="inline-flex items-center px-3 py-2 rounded-full bg-red-100 text-red-800 text-sm">
            <X className="w-4 h-4 mr-1" /> Error
          </span>
        );
      case "accept":
        return (
          <span className="inline-flex items-center px-3 py-2 rounded-full bg-green-100 text-green-800 text-sm">
            <Check className="w-4 h-4 mr-1" /> Accepted
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-3 py-2 rounded-full bg-yellow-100 text-yellow-800 text-sm">
            <Clock className="w-4 h-4 mr-1" /> Pending
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-3 py-2 rounded-full bg-red-100 text-red-800 text-sm">
            <X className="w-4 h-4 mr-1" /> Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-2 rounded-full bg-gray-100 text-gray-800 text-sm">
            <AlertCircle className="w-4 h-4 mr-1" /> Unknown
          </span>
        );
    }
  };

  if (isLoading || !formData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto p-6 bg-white rounded-lg shadow-sm">
        <div className="flex w-full mb-5 justify-between items-center">
          <div className="">
            <h2 className="text-xl font-bold text-gray-900 flex items-start gap-10">
              Request Details
            </h2>

            <div className="flex items-center gap-10 mt-5">
              <div className="  flex items-start flex-col gap-2">
                <h2 className="text-md  font-semibold text-gray-900 ">
                  Request Status
                </h2>
                {getStatusBadge(formData.loanDetails?.admin_request_status)}
              </div>
              <div className="flex items-start flex-col gap-2">
                <h3 className="text-md  font-semibold text-gray-900 ">
                  Request Stage
                </h3>
                {getStatusBadge(formData.loanDetails?.request_stage)}
              </div>
            </div>

           
            {/* 
            <div className="flex items-center gap-10">
              <div className="  ">
                <h2 className="text-md  font-semibold text-gray-900 flex items-center gap-5">
                  Request Status
                </h2>
                {getStatusBadge(formData.loanDetails?.admin_request_status)}
              </div>
              <div className="">
                <h3 className="text-md  font-semibold text-gray-900 flex items-center gap-5">
                  Request Stage
                </h3>
                {getStatusBadge(formData.loanDetails?.request_stage)}
              </div>
            </div> */}
          </div>

          <div>
          {
              <ActionButtons
                initialStatus={formData?.loanDetails?.admin_request_status}
                onRequestApproved={() => getLoanRequest(false)}
                loanId={id}
              />
            }
          </div>
        </div>

        <div>{formData && renderStepper()}</div>

        {/* Personal Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg my-2 font-semibold text-gray-800 flex items-center gap-2">
            <User className="w-5 h-5 text-gray-600" />
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <dt className="text-sm font-medium text-gray-500">Name</dt>
              <dd className="mt-1 text-md font-semibold text-gray-900">
                {formData.customerData?.first_name}{" "}
                {formData.customerData?.last_name}
              </dd>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <dt className="text-sm font-medium text-gray-500">Birth Date</dt>
              <dd className="mt-1 text-md font-semibold text-gray-900">
                {formatDate(formData.loanDetails?.birth_date)}
              </dd>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-md font-semibold text-gray-900">
                {formData.customerData?.email || "-"}
              </dd>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="mt-1 text-md font-semibold text-gray-900">
                {formData.customerData?.phone || "-"}
              </dd>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <dt className="text-sm font-medium text-gray-500">Gender</dt>
              <dd className="mt-1 text-md font-semibold text-gray-900">
                {formData.loanDetails?.gender
                  ? formData.loanDetails.gender.charAt(0).toUpperCase() +
                    formData.loanDetails.gender.slice(1)
                  : "-"}
              </dd>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <dt className="text-sm font-medium text-gray-500">
                Social Insurance Number
              </dt>
              <dd className="mt-1 text-md font-semibold text-gray-900">
                {formData.loanDetails?.social_insurance_number
                  ? "••••••••• (Provided)"
                  : "Not provided"}
              </dd>
            </div>
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg my-2 font-semibold text-gray-800 flex items-center gap-2">
            <User className="w-5 h-5 text-gray-600" />
            Reference Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <dt className="text-sm font-medium text-gray-500">
                Reference 01
              </dt>
              <dd className="mt-1 text-md font-semibold text-gray-900">
                {formData.reference[0].name}{" "}
                <small>( {formData?.reference[0].relationship} )</small>
              </dd>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="mt-1 text-md font-semibold text-gray-900">
                {formData.reference[0].phone}
              </dd>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <dt className="text-sm font-medium text-gray-500">
                Reference 02
              </dt>
              <dd className="mt-1 text-md font-semibold text-gray-900">
                {formData.reference[1].name}{" "}
                <small>( {formData?.reference[1].relationship} )</small>
              </dd>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="mt-1 text-md font-semibold text-gray-900">
                {formData.reference[1].phone}
              </dd>
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="space-y-4">
          <h3 className="text-lg my-2 font-semibold text-gray-800 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gray-600" />
            Address
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <dt className="text-sm font-medium text-gray-500">
                Street Address
              </dt>
              <dd className="mt-1 text-md font-semibold text-gray-900">
                {formData.loanDetails?.address_line1 || "-"}
                {formData.loanDetails?.address_line2 && (
                  <span>
                    <br />
                    {formData.loanDetails.address_line2}
                  </span>
                )}
              </dd>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <dt className="text-sm font-medium text-gray-500">City</dt>
              <dd className="mt-1 text-md font-semibold text-gray-900">
                {formData.loanDetails?.city || "-"}
              </dd>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <dt className="text-sm font-medium text-gray-500">Province</dt>
              <dd className="mt-1 text-md font-semibold text-gray-900">
                {formData.loanDetails?.province
                  ? getProvinceName(formData.loanDetails.province)
                  : "-"}
              </dd>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <dt className="text-sm font-medium text-gray-500">Postal Code</dt>
              <dd className="mt-1 text-md font-semibold text-gray-900">
                {formData.loanDetails?.postal_code || "-"}
              </dd>
            </div>
          </div>
        </div>

        {/* Income Source Section */}
        <div className="space-y-4">
          <h3 className="text-lg my-2 font-semibold text-gray-800 flex items-center gap-2">
            <Banknote className="w-5 h-5 text-gray-600" />
            Income Source
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <dt className="text-sm font-medium text-gray-500">
                Income Source
              </dt>
              <dd className="mt-1 text-md font-semibold text-gray-900">
                {formData.loanDetails?.income_source
                  ? getIncomeSourceName(formData.loanDetails.income_source)
                  : "-"}
              </dd>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <dt className="text-sm font-medium text-gray-500">
                Bank Institution
              </dt>
              <dd className="mt-1 text-md font-semibold text-gray-900">
                {formData.loanDetails?.bank_institution
                  ? getBankName(formData.loanDetails.bank_institution)
                  : "-"}
              </dd>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <dt className="text-sm font-medium text-gray-500">
                Pay Frequency
              </dt>
              <dd className="mt-1 text-md font-semibold text-gray-900">
                {formData.loanDetails?.pay_frequency
                  ? getPayFrequencyText(formData.loanDetails.pay_frequency)
                  : "-"}
              </dd>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <dt className="text-sm font-medium text-gray-500">
                Next Pay Date
              </dt>
              <dd className="mt-1 text-md font-semibold text-gray-900">
                {formatDate(formData.loanDetails?.next_pay_date)}
              </dd>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <dt className="text-sm font-medium text-gray-500">
                Consumer Proposal
              </dt>
              <dd className="mt-1 text-md font-semibold text-gray-900">
                {formData.loanDetails?.consumer_proposal === true
                  ? "Yes"
                  : "No"}
              </dd>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <dt className="text-sm font-medium text-gray-500">Bankruptcy</dt>
              <dd className="mt-1 text-md font-semibold text-gray-900">
                {formData.loanDetails?.bankruptcy === true ? "Yes" : "No"}
              </dd>
            </div>
          </div>
        </div>

        {/* Loan Details Section */}
        <div className="space-y-4">
          <h3 className="text-lg my-2 font-semibold text-gray-800 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-gray-600" />
            Loan Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <dt className="text-sm font-medium text-gray-500">
                Selected Loan
              </dt>
              <dd className="mt-1 text-md font-semibold text-gray-900">
                {formData.loanPackage
                  ? `${formatCurrency(formData.loanPackage.amount)} for ${
                      formData.loanPackage.duration
                    }`
                  : "No loan selected"}
              </dd>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <dt className="text-sm font-medium text-gray-500">
                Pay Frequency
              </dt>
              <dd className="mt-1 text-md font-semibold text-gray-900">
                {formData.payFrequency || "-"}
              </dd>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <dt className="text-sm font-medium text-gray-500">
                Request Date
              </dt>
              <dd className="mt-1 text-md font-semibold text-gray-900">
                {formatDate(formData.loanDetails?.request_date)}
              </dd>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <dt className="text-sm font-medium text-gray-500">
                File Treatment Method
              </dt>
              <dd className="mt-1 text-md font-semibold text-gray-900">
                {getFileTreatmentText(
                  formData.loanDetails?.file_treatment_method
                )}
              </dd>
            </div>
            {/* <div className="bg-gray-50 p-4 rounded-lg">
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1 text-md font-semibold text-gray-900">
              {getStatusBadge(formData.loanDetails?.status)}
            </dd>
          </div>
          */}
          </div>
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

export default AdminRequestView;
