import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {deleteUser, getUsers} from "@/services/userService";
import {toast} from "@/components/ui/use-toast";
import {getErrorMessage} from "~/utils/errorHandler.ts";
import {Pagination} from "../../../core/components";
import {Card} from "@/components/ui/card";
import {UserResponse} from "@/constants/types/userTypes";
import {PagedResponse} from "@/constants/types/commonTypes";
import {Button} from "@/components/ui/button";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {EmployeeTable} from "@/modules/Users/components/EmployeeTable.tsx";
import DeleteEmployeeDialog from "@/modules/Users/components/DeleteEmployeeDialog.tsx";
import FilterEmployeesForm from "@/modules/Users/components/FilterEmployeesForm.tsx";
import PageContent from "@/core/components/PageContent.tsx";
import {PageHeader} from "@/core/components";

export default function EmployeesPage() {
    const [employeesList, setEmployeesList] = useState<PagedResponse<UserResponse> | null>(null);
    const [filteredEmployees, setFilteredEmployees] = useState<UserResponse[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<UserResponse | null>(null);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
    const [currentEmployee, setCurrentEmployee] = useState<UserResponse | null>(null);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState<number>(1);
    const recordsPerPage: number = 10;

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await getUsers(0, 30);
                setEmployeesList(data);
                setFilteredEmployees(data.contents);
            } catch (error) {
                toast({
                    title: "Error",
                    description: getErrorMessage(error as Error),
                    variant: "destructive",
                });
            }
        };

        fetchUsers();
    }, []);

    const handleFilter = (query: string, teamId: string) => {
        const filtered = employeesList?.contents.filter((employee) => {
            const matchesQuery =
                query === "" || employee.email.includes(query) || employee.firstName.includes(query) || employee.lastName?.includes(query);
            const matchesTeam = teamId === "" || employee.team.id.toString() === teamId;
            return matchesQuery && matchesTeam;
        });

        setFilteredEmployees(filtered || []);
    };

    const handleDeleteEmployee = async (id: number) => {
        try {
            setIsProcessing(true);
            await deleteUser(String(id));
            setEmployeesList((prevState) => ({
                ...prevState,
                contents: prevState?.contents.filter((employee) => employee.id !== id),
            }));
            toast({
                title: "Success",
                description: "Employee removed successfully!",
                variant: "default",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: getErrorMessage(error as Error),
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
            setSelectedEmployeeId(null);
        }
    };

    const paginatedEmployees = filteredEmployees.slice(
        (currentPage - 1) * recordsPerPage,
        currentPage * recordsPerPage
    );

    return (
        <>
            <PageHeader title={`Employees (${employeesList?.contents?.length ?? 0})`}>
                <Button className="px-2 h-9" onClick={() => navigate("/employee/create")}>Create</Button>
            </PageHeader>

            <FilterEmployeesForm onFilter={handleFilter}/>

            <PageContent>
                <Card className="flex flex-1 flex-col rounded-lg border border-dashed shadow-sm p-4 gap-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Team</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        {filteredEmployees.length > 0 ? (
                            <EmployeeTable
                                employeesList={paginatedEmployees || []}
                                setSelectedEmployee={setSelectedEmployee}
                                setCurrentEmployee={setCurrentEmployee}
                            />
                        ) : (
                            <TableBody>
                                <TableRow>
                                    <TableCell colSpan={4} className="p-2 text-center text-sm">
                                        No employees found.
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        )}
                    </Table>

                    {selectedEmployee && (
                        <DeleteEmployeeDialog
                            employee={selectedEmployee}
                            handleDeleteEmployee={handleDeleteEmployee}
                            setSelectedEmployeeId={() => setSelectedEmployee(null)}
                            isProcessing={isProcessing}
                        />
                    )}

                    {filteredEmployees.length > recordsPerPage && (
                        <Pagination
                            pageSize={recordsPerPage}
                            pageNumber={currentPage}
                            setPageNumber={setCurrentPage}
                            totalContents={filteredEmployees.length}
                        />
                    )}
                </Card>
            </PageContent>
        </>
    );
}