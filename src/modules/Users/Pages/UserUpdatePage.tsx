import React, {useEffect, useState} from "react";
import {useForm, UseFormReturn} from "react-hook-form";
import {useNavigate, useParams} from "react-router-dom";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {toast} from "@/components/ui/use-toast";
import {getTeams} from "@/services/teamService";
import {getLeavesPolicies} from "@/services/leaveService";
import {getUser, updateUser} from "@/services/userService";
import {TeamResponse} from "@/constants/types/teamTypes";
import {LeavePolicyResponse} from "@/constants/types/leaveTypes";
import {UserResponse, UserUpdateRequest} from "@/constants/types/userTypes";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import PageContent from "@/core/components/PageContent";
import {PageHeader} from "@/core/components";
import {getErrorMessage} from "@/utils/errorHandler.ts";

const FormSchema = z.object({
    firstName: z.string().min(1, {message: "First Name is required"}),
    lastName: z.string().min(1, {message: "Last Name is required"}),
    email: z.string().email({message: "Invalid email address"}),
    phone: z.string().optional(),
    teamId: z.number().positive({message: "Team selection is required"}),
    leavePolicyId: z.number().positive({message: "Leave Policy selection is required"}),
});

export default function UserUpdatePage() {
    const {id} = useParams();
    const navigate = useNavigate();
    const [employee, setEmployee] = useState<UserResponse | null>(null);
    const [teams, setTeams] = useState<TeamResponse[]>([]);
    const [leavePolicies, setLeavePolicies] = useState<LeavePolicyResponse[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            teamId: 0,
            leavePolicyId: 0,
        },
    });

    const {reset} = form;

    // Fetch employee details
    useEffect(() => {
        const fetchEmployeeDetails = async () => {
            try {
                const employeeData = await getUser(id!);
                setEmployee(employeeData);
                reset({
                    firstName: employeeData.firstName,
                    lastName: employeeData.lastName,
                    email: employeeData.email,
                    phone: employeeData.phone || "",
                    teamId: employeeData.team.id,
                    leavePolicyId: employeeData.leavePolicy.id,
                });
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to fetch employee details.",
                    variant: "destructive",
                });
            }
        };

        fetchEmployeeDetails();
    }, [id, reset]);

    // Fetch teams and leave policies
    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [teamData, policyData] = await Promise.all([getTeams(), getLeavesPolicies()]);
                setTeams(teamData);
                setLeavePolicies(policyData);
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to fetch teams or leave policies.",
                    variant: "destructive",
                });
            }
        };

        fetchMetadata();
    }, []);

    const onSubmit = async (data: z.infer<typeof FormSchema>) => {
        const payload: UserUpdateRequest = {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone || null,
            teamId: data.teamId,
            leavePolicyId: data.leavePolicyId,
        };

        try {
            setIsProcessing(true);
            await updateUser(id!, payload);
            toast({
                title: "Success",
                description: "Employee updated successfully!",
                variant: "default",
            });
            navigate("/employees");
        } catch (error) {
            toast({
                title: "Error",
                description: getErrorMessage(error as Error),
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    if (!employee) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <PageHeader title="Update Employee" backButton="/employees"/>
            <PageContent>
                <Card className="flex flex-1 flex-col rounded-lg border border-dashed shadow-sm p-4">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                            <FirstnameField form={form}/>
                            <LastNameField form={form}/>
                            <EmailField form={form}/>
                            <PhoneField form={form}/>
                            <TeamField form={form} teams={teams}/>
                            <LeavePolicyField form={form} leavePolicies={leavePolicies}/>
                            <Button type="submit" className="w-fit" disabled={isProcessing}>
                                {isProcessing ? "Processing..." : "Update"}
                            </Button>
                        </form>
                    </Form>
                </Card>
            </PageContent>
        </>
    );
}

type FieldProps = {
    form: UseFormReturn;
    teams?: TeamResponse[];
    leavePolicies?: LeavePolicyResponse[];
};

function FirstnameField({form}: FieldProps) {
    return (
        <FormField
            control={form.control}
            name="firstName"
            render={({field}) => (
                <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                        <Input placeholder="First Name" {...field} />
                    </FormControl>
                    <FormMessage/>
                </FormItem>
            )}
        />
    );
}

function LastNameField({form}: FieldProps) {
    return (
        <FormField
            control={form.control}
            name="lastName"
            render={({field}) => (
                <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                        <Input placeholder="Last Name" {...field} />
                    </FormControl>
                    <FormMessage/>
                </FormItem>
            )}
        />
    );
}

function EmailField({form}: FieldProps) {
    return (
        <FormField
            control={form.control}
            name="email"
            render={({field}) => (
                <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                        <Input placeholder="Email" {...field} />
                    </FormControl>
                    <FormMessage/>
                </FormItem>
            )}
        />
    );
}

function PhoneField({form}: FieldProps) {
    return (
        <FormField
            control={form.control}
            name="phone"
            render={({field}) => (
                <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                        <Input placeholder="Phone" {...field} />
                    </FormControl>
                    <FormMessage/>
                </FormItem>
            )}
        />
    );
}

function TeamField({form, teams}: FieldProps) {
    return (
        <FormField
            control={form.control}
            name="teamId"
            render={({field}) => (
                <FormItem>
                    <FormLabel>Team</FormLabel>
                    <FormControl>
                        <Select
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            value={field.value !== 0 ? field.value?.toString() : ""}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a team"/>
                            </SelectTrigger>
                            <SelectContent>
                                {teams?.map((team) => (
                                    <SelectItem key={team.id} value={team.id.toString()}>
                                        {team.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormControl>
                    <FormMessage/>
                </FormItem>
            )}
        />
    );
}

function LeavePolicyField({form, leavePolicies}: FieldProps) {
    return (
        <FormField
            control={form.control}
            name="leavePolicyId"
            render={({field}) => (
                <FormItem>
                    <FormLabel>Leave Policy</FormLabel>
                    <FormControl>
                        <Select
                            onValueChange={(value) => field.onChange(parseInt(value))}
                            value={field.value !== 0 ? field.value?.toString() : ""}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a leave policy"/>
                            </SelectTrigger>
                            <SelectContent>
                                {leavePolicies?.map((policy) => (
                                    <SelectItem key={policy.id} value={policy.id.toString()}>
                                        {policy.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormControl>
                    <FormMessage/>
                </FormItem>
            )}
        />
    );
}