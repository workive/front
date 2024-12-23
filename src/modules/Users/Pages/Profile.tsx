import React, {useContext, useEffect, useState} from 'react'
import {useForm, UseFormReturn} from "react-hook-form"
import {zodResolver} from "@hookform/resolvers/zod"
import {z} from "zod"
import {getCurrentUser, updateUser} from "@/services/userService";
import {getErrorMessage} from "~/utils/errorHandler.ts"
import {PageTitle} from '../../../core/components'
import {AssetResponse, UserUpdateRequest} from '@/constants/types/userTypes'
import {AlertDescription, Alert} from "@/components/ui/alert"
import {Camera} from "lucide-react"
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form"
import {Input} from "@/components/ui/input"
import {toast} from "@/components/ui/use-toast"
import {Card} from "@/components/ui/card";
import {UserContext} from "@/contexts/UserContext";
import {ChangePictureDialog} from "@/modules/Users/components/ChangePictureDialog.tsx";
import {Button} from "@/components/ui/button.tsx";

const FormSchema = z.object({
    firstName: z.string().min(2, {
        message: "First Name must be at least 2 characters.",
    }).max(20, {
        message: "First Name must be under 20 characters.",
    }),
    lastName: z.string().min(2, {
        message: "Last Name must be at least 2 characters.",
    }).max(20, {
        message: "Last Name must be under 20 characters.",
    })
});

const DEFAULT_USER_AVATAR = "https://upload.wikimedia.org/wikipedia/commons/0/09/Man_Silhouette.png";

export default function Profile() {
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [isProcessing, setIsProcessing] = useState<boolean>(false)
    const {accessToken, user, setUser} = useContext(UserContext);
    const [selectedAvatar, setSelectedAvatar] = useState(null);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
        },
    });

    const {reset} = form;

    // Fetch employee information on mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const user = await getCurrentUser();
                setUser(user);
                reset({
                    firstName: user.firstName,
                    lastName: user.lastName,
                });
            } catch (error) {
                const errorMessage = getErrorMessage(error as Error | string);
                setErrorMessage(errorMessage);
                toast({
                    title: "Error",
                    description: errorMessage,
                    variant: "destructive",
                });
            }
        };
        fetchUserData();
    }, [reset]);

    // Handle form submission
    const onSubmit = async (data: z.infer<typeof FormSchema>) => {
        try {
            const payload: UserUpdateRequest = {
                firstName: data.firstName,
                lastName: data.lastName,
            };
            setIsProcessing(true);
            const updateUserResponse = await updateUser(payload);
            setIsProcessing(false);
            setUser(updateUserResponse);
            toast({
                title: "Success",
                description: "Profile updated successfully!",
                variant: "default",
            });
        } catch (error) {
            setIsProcessing(false);
            console.error("Error:", error);
            const errorMessage = getErrorMessage(error as Error | string);
            setErrorMessage(errorMessage);
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        }
    }

    // Handle file change for the profile picture
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const url = URL.createObjectURL(e.target.files[0]);
            setSelectedAvatar(url);
        }
        e.target.value = "";
    };

    const handleUpdateUserAvatar = (asset: AssetResponse | null) => {
        if (asset) {
            setUser({...user, avatar: asset});
        }
        setSelectedAvatar(null);
    };

    return (
        <>
            <PageTitle title="Profile"></PageTitle>

            {errorMessage && (
                <Alert className='text-red-500 border-none px-0 font-semibold'>
                    <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
            )}

            <main className="flex flex-1 flex-col gap-4 p-4">
                <Card className="flex flex-1 flex-col rounded-lg border border-dashed shadow-sm p-4" x-chunk="dashboard-02-chunk-1">
                    <div>
                        <div className='w-40 flex flex-col right-0 left-0 mx-auto'>
                            <img
                                src={
                                    user?.avatar?.url
                                        ? `${user.avatar.url}?token=${accessToken}`
                                        : DEFAULT_USER_AVATAR
                                }
                                alt='Profile Image' className="h-40 w-40 rounded-full"/>
                            <div className='bg-indigo-500 w-12 h-12 flex flex-row items-center rounded-full relative bottom-10 left-24'>
                                <label className='right-0 left-0 mx-auto z-10 cursor-pointer' htmlFor="upload-photo">
                                    <Camera className='w-7 h-7 text-white'></Camera>
                                </label>
                                <input id='upload-photo' type="file" accept="image/jpeg, image/png"
                                       className='hidden' onChange={handleFileChange}/>
                            </div>
                        </div>

                        {selectedAvatar && (<ChangePictureDialog initialImageUrl={selectedAvatar} onChange={handleUpdateUserAvatar}/>)}
                    </div>

                    <FullNameField form={form} onSubmit={onSubmit} isProcessing={isProcessing} />
                </Card>
            </main>
        </>
    )
}


type FieldProps = {
    form: UseFormReturn;
    onSubmit: (data: z.infer<typeof FormSchema>) => void;
    isProcessing: boolean;
}

function FullNameField({form, onSubmit, isProcessing}: FieldProps) {
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
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
            <Button type="submit" className="w-fit">{isProcessing ? "Waiting ..." : "Submit"}</Button>
            </form>
        </Form>
    )
}