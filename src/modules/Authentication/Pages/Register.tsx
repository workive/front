import React, {useState, useContext} from "react";
import {useForm} from "react-hook-form";
import {useNavigate} from "react-router-dom";
import {registration} from "~/services/WorkiveApiClient.ts";
import {UserContext} from "~/contexts/UserContext.tsx";
import {toast} from "@/components/ui/use-toast";
import {getErrorMessage} from "~/utils/errorHandler.ts";
import {countries} from '~/constants/index.ts';
import {AuthenticationResponse, RegistrationRequest} from "~/constants/types";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Eye, EyeOff} from 'lucide-react';
import {Logo} from "../../../core/components";

const FormSchema = z.object({
    email: z.string().email({message: "Email format is not correct"}),
    password: z.string().min(8, {message: "Password must be over 8 characters"}),
    firstName: z.string().min(2, {message: "First Name must be at least 2 characters"}),
    lastName: z.string().min(2, {message: "Last Name must be at least 2 characters"}),
    organization: z.string().min(2, {message: "Organization must be at least 2 characters"}),
    phone: z.string().optional(),
    country: z.string().min(1, {message: "Country is required"}),
});

export default function Register() {
    const {authenticate} = useContext(UserContext);
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            email: "",
            password: "",
            firstName: "",
            lastName: "",
            organization: "",
            phone: "",
            country: "",
        },
    });

    const onSubmit = (data: z.infer<typeof FormSchema>) => {
        const payload: RegistrationRequest = {
            email: data.email,
            password: data.password,
            firstName: data.firstName,
            lastName: data.lastName,
            organizationName: data.organization,
            phone: data.phone,
            countryCode: data.country,
            timezone: 'Asia/Tehran',
        };

        setIsProcessing(true);
        registration(payload)
            .then((response: AuthenticationResponse) => {
                setIsProcessing(false);
                authenticate(response.accessToken, response.user);
                navigate('/organization');
            })
            .catch((error: string | null) => {
                setIsProcessing(false);
                const errorMessage = getErrorMessage(error);
                setErrorMessage(errorMessage);
                toast({
                    title: "Error",
                    description: errorMessage,
                    variant: "destructive",
                });
            });
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="w-full max-w-md p-6 bg-white shadow-lg rounded-lg">
                <div className="flex flex-col items-center mb-6">
                    <Logo className="h-10 w-auto"/>
                    <h1 className="text-3xl font-semibold">Teamwize</h1>
                    <h2 className="text-2xl font-semibold mt-4">Create an Account</h2>
                </div>

                {errorMessage && (
                    <Alert>
                        <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                )}

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="organization"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Organization Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Organization" {...field}/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <div className="flex gap-4">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="First Name" {...field}/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({field}) => (
                                    <FormItem>
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Last Name" {...field}/>
                                        </FormControl>
                                        <FormMessage/>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="email"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Email" {...field}/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phone"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Phone</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Phone" {...field}/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                placeholder="Password"
                                                type={showPassword ? "text" : "password"}
                                                {...field}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 flex items-center px-2"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-5 w-5"/>
                                                ) : (
                                                    <Eye className="h-5 w-5"/>
                                                )}
                                            </button>
                                        </div>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="country"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Country</FormLabel>
                                    <FormControl>
                                        <select
                                            className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            {...field}
                                        >
                                            <option value="">Choose your country</option>
                                            {countries.map((country) => (
                                                <option key={country.code} value={country.code}>{country.name}</option>
                                            ))}
                                        </select>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full mt-4">{isProcessing ? "Waiting..." : "Sign Up"}</Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}