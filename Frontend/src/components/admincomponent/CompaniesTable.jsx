import React, { useEffect, useState, useMemo } from "react";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Edit2, MoreHorizontal } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { DataTable } from "../shared";

const CompaniesTable = () => {
  const { companies, searchCompanyByText } = useSelector(
    (store) => store.company
  );
  const navigate = useNavigate();
  const [filterCompany, setFilterCompany] = useState(companies || []);

  useEffect(() => {
    if (!companies) return;
    const filteredCompany = companies.filter((company) => {
      if (!searchCompanyByText) {
        return true;
      }
      return company.name
        ?.toLowerCase()
        .includes(searchCompanyByText.toLowerCase());
    });
    setFilterCompany(filteredCompany);
  }, [companies, searchCompanyByText]);

  const columns = useMemo(
    () => [
      {
        header: "Logo",
        priority: "primary",
        className: "w-16",
        cell: (company) => (
          <Avatar className="w-9 h-9">
            <AvatarImage
              src={company.logo || "https://www.shutterstock.com/image-vector/circle-line-simple-design-logo-600w-2174926871.jpg"}
              alt={`${company.name} logo`}
            />
          </Avatar>
        ),
      },
      {
        header: "Company Name",
        accessorKey: "name",
        priority: "primary",
        sortable: true,
        cell: (company) => <span className="font-semibold text-gray-900 dark:text-gray-100 break-words">{company.name}</span>,
      },
      {
        header: "Date",
        accessorKey: "createdAt",
        priority: "secondary",
        sortable: true,
        cell: (company) => (company.createdAt ? company.createdAt.split("T")[0] : "Recent"),
      },
      {
        header: "Action",
        priority: "primary",
        className: "text-right",
        headerClassName: "text-right",
        cell: (company) => (
          <div className="flex justify-end">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  aria-label="Open company actions menu"
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
                >
                  <MoreHorizontal className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-32 p-2">
                <div
                  onClick={() => navigate(`/recruiter/companies/${company._id}`)}
                  className="flex items-center gap-2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer text-xs font-medium text-gray-700 dark:text-gray-200"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit</span>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        ),
      },
    ],
    [navigate]
  );

  const renderCompanyMobileCard = (company) => {
    const dateStr = company.createdAt ? company.createdAt.split("T")[0] : "Recent";
    return (
      <div
        data-testid="company-mobile-card"
        className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="w-11 h-11 ring-1 ring-gray-200 dark:ring-gray-700 shrink-0">
            <AvatarImage
              src={company.logo || "https://www.shutterstock.com/image-vector/circle-line-simple-design-logo-600w-2174926871.jpg"}
              alt={`${company.name} logo`}
            />
          </Avatar>
          <div className="min-w-0">
            <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate break-words">
              {company.name}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">Registered: {dateStr}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate(`/recruiter/companies/${company._id}`)}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 shrink-0 min-h-[44px]"
        >
          <Edit2 className="w-3.5 h-3.5 text-purple-600" />
          <span>Edit</span>
        </button>
      </div>
    );
  };

  if (!companies) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full">
      <DataTable
        columns={columns}
        data={filterCompany}
        caption="Your recent registered Companies"
        emptyMessage="No Companies Added"
        tableClassName="md:min-w-[550px]"
        mobileCard={renderCompanyMobileCard}
      />
    </div>
  );
};

export default CompaniesTable;
