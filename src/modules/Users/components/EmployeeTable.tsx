import {UserResponse} from "@/constants/types/userTypes.ts";
import React from "react";
import {TableBody, TableCell, TableRow} from "@/components/ui/table.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Pencil, Trash} from "lucide-react";
import {Avatar} from "@/core/components";
import {useNavigate} from "react-router-dom";

type EmployeeTableProps = {
    employeesList: UserResponse[];
    setSelectedEmployee: (employee: UserResponse | null) => void;
    setCurrentEmployee: (employee: UserResponse) => void;
};

export function EmployeeTable({employeesList, setSelectedEmployee, setCurrentEmployee}: EmployeeTableProps) {
    const navigate = useNavigate();

    return (
        <TableBody>
            {employeesList.map((employee) => (
                <TableRow key={employee.id} className="items-center">
                    <TableCell className='flex items-center'>
                        <Avatar avatar={employee?.avatar} avatarSize={32}/>
                        <span className="text-sm font-medium ml-2">{employee.firstName} {employee.lastName}</span>
                    </TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{employee.team.name}</TableCell>
                    <TableCell className="text-right">
                        <div className="flex gap-4 justify-end">
                            <Button
                                className="px-1"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    setCurrentEmployee(employee);
                                    navigate(`/employee/update/${employee.id}`);
                                }}
                            >
                                <Pencil className="h-4" />
                            </Button>

                            <Button
                                className="px-1"
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedEmployee(employee)}
                            >
                                <Trash className="h-4 text-[#ef4444]" />
                            </Button>
                        </div>
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    );
}