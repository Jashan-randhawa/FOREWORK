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
        sortable: true,
        cell: (company) => <span className="font-semibold text-gray-900 dark:text-gray-100">{company.name}</span>,
      },
      {
        header: "Date",
        accessorKey: "createdAt",
        sortable: true,
        cell: (company) => (company.createdAt ? company.createdAt.split("T")[0] : "Recent"),
      },
      {
        header: "Action",
        className: "text-right",
        headerClassName: "text-right",
        cell: (company) => (
          <div className="flex justify-end">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  aria-label="Open company actions menu"
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
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
        tableClassName="min-w-[550px]"
      />
    </div>
  );
};

export default CompaniesTable;
