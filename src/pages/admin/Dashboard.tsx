import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Customer } from "../../lib/types";
import RecentRequests from "../../components/Admin/recentRequests";
import { useNavigate } from "react-router-dom";
import { supabase } from "/src/lib/supabase";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [customerData, setCustomerData] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [perceptionStatsData, setPerceptionStatsData] = useState([]);

  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("customers")
          .select("*")
          .eq("auth_id", user.id)
          .single();

        if (error) {
          console.error("Error fetching customer data:", error);
        } else {
          setCustomerData(data);
        }
      } catch (err) {
        console.error("Unexpected error fetching customer data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchCustomerData();
    }
  }, [user]);

  const [statsData, setStatsData] = useState([]);
  const navigate = useNavigate();

  // Define status mapping to match the image
  const statusMapping = {
    "Application": { label: "Application", color: "bg-blue-50 border-blue-200" },
    "Document": { label: "Document", color: "bg-green-50 border-green-200" },
    "Validation": { label: "Validation", color: "bg-purple-50 border-purple-200" },
    "Evaluation": { label: "Evaluation", color: "bg-yellow-50 border-yellow-200" }, // "Rating" in UI
    "Signature": { label: "Signature", color: "bg-blue-50 border-blue-200" },
    "Deposit": { label: "Deposit", color: "bg-teal-50 border-teal-200" },
    "Express Deposit": { label: "Express Deposit", color: "bg-violet-50 border-violet-200" }, // "Optional Pricing" in UI
    "Completed": { label: "Completed", color: "bg-emerald-50 border-emerald-200" },
    "Error": { label: "Error", color: "bg-red-50 border-red-200" }
  };


  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: responseData, error } = await supabase.functions.invoke('fetch-loan-requests');
    
      if (error) {
        console.error("Failed to fetch loan requests:", error);
        return;
      }
    
      const data = responseData?.data;
    
      // Process data to count by status and time periods
      const processedData = processRequestsByStatus(data);
      setStatsData(processedData);
    } catch (error) {
      console.error("Error processing dashboard data:", error);
    }
  };

  
  const processRequestsByStatus = (requests) => {
    // Get current date
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Initialize counters for each status
    const result = Object.keys(statusMapping).map(status => ({
      status,
      label: statusMapping[status].label,
      color: statusMapping[status].color,
      week: 0,
      month: 0,
      year: 0,
      has: 0
    }));

    // Count requests by status and time period
    requests.forEach(request => {
      // Map the request status to our defined statuses
      let status = request.request_stage;
      console.log(request)
      console.log(status)
      
      // Map your backend statuses to the UI statuses if needed
      // For example: if status is "reviewing documents", map it to "document"
      // if (status === "reviewing documents") status = "document";
      // if (status === "evaluation") status = "rating";
      
      // Find the corresponding status in our result array
      const statusObj = result.find(s => s.status === status);
      if (!statusObj) return;
      
      // Increment total count
      statusObj.has++;
      
      // Check time periods
      const requestDate = new Date(request.created_at);
      if (requestDate >= startOfWeek) {
        statusObj.week++;
      }
      if (requestDate >= startOfMonth) {
        statusObj.month++;
      }
      if (requestDate >= startOfYear) {
        statusObj.year++;
      }
    });

    return result;
  };

  const handleCardClick = (status) => {
    // Navigate to the admin requests page with the status filter
    navigate(`/admin/requests?status=${status}`);
  };

  const perceptionStages = [
    "New",
    "Negotiation",
    "Notice 7 Days",
    "Notice 72h",
    "Pre Collection",
    "Collection",
    "Loss",
    "Resolved",
  ];

  function countPerceptionRequestsByStage(perceptionRequests) {
    const stageCounts = perceptionStages.reduce((acc, stage) => {
      acc[stage] = 0;
      return acc;
    }, {});

    if (!perceptionRequests || !Array.isArray(perceptionRequests)) {
      return stageCounts;
    }

    perceptionRequests.forEach((request) => {
      if (stageCounts.hasOwnProperty(request.stage)) {
        stageCounts[request.stage]++;
      }
    });

    return stageCounts;
  }

  function createPerceptionStatusArray(stageCounts) {
    return Object.keys(stageCounts).map((stage) => ({
      status: stage,
      count: stageCounts[stage],
    }));
  }

  async function renderPerceptionStatusCards() {
    try {
      const { data: responseData, error } = await supabase.functions.invoke('fetch-perceptions');
    
      if (error) {
        console.error("Failed to fetch perception requests:", error);
        return;
      }
    
      const stageCounts = countPerceptionRequestsByStage(responseData?.data);
      const stageArray = createPerceptionStatusArray(stageCounts);
      setPerceptionStatsData(stageArray);
    } catch (error) {
      console.error("Unexpected error while fetching perception requests:", error);
    }
  }

  useEffect(() => {
    return () => {
      renderPerceptionStatusCards();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      {customerData && (
        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <h2 className="text-xl font-semibold mb-2">Welcome, Admin !</h2>
        </div>
      )}

      {/* Stats Grid */}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {statsData.map((item, index) => (
          <div 
            key={index}
            className={`border ${item.color} rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow`}
            onClick={() => handleCardClick(item.status)}
          >
            <div className="flex flex-col">
              <div className="mb-2">
                <h3 className="font-medium text-gray-700">{item.label}</h3>
              </div>
              
              <div className="grid grid-cols-3 text-center mb-2">
                <div className="text-xs text-gray-500">S</div>
                <div className="text-xs text-gray-500">M</div>
                <div className="text-xs text-gray-500">HAS</div>
              </div>
              
              <div className="grid grid-cols-3 text-center mb-1">
                <div className="text-lg font-semibold">{item.week}</div>
                <div className="text-lg font-semibold">{item.month}</div>
                <div className="text-lg font-semibold">{item.has}</div>
              </div>
              
             
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Requests
          </h3>
        </div>
        <div className="p-4 sm:p-6">
          {/* <div className="text-center py-8">
            <p className="text-gray-500">No recent loan requests to display.</p>

          </div> */}
          <RecentRequests />
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
